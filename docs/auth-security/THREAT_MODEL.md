# EtherXMeet — Auth Threat Model & Secure Defaults

**Owner:** Thanushree H C (Security hardening + testing + documentation)
**Scope:** `/api/auth/*` endpoints — local password auth, Google OAuth, Web3Auth — plus
the decentralization layer's effect on session/authorization (as it lands).

This document tracks what's already mitigated in code, what's a known open risk, and
who owns closing each gap. Update it as the other pieces (Web3Auth UI, Polygon
contract) land — this is meant to be a living doc, not a one-time report.

---

## 1. Assets & trust boundaries

| Asset | Where it lives | Why it matters |
|---|---|---|
| User password hash | `User.password` (MongoDB) | Compromise = account takeover for local accounts |
| JWT signing secret | `process.env.JWT_SECRET` | Compromise = attacker can forge valid session tokens for *any* user |
| Password reset token | `User.resetPasswordToken` (hashed), emailed raw token | Compromise = account takeover without knowing the password |
| Web3Auth idToken | Passed from frontend to `/api/auth/web3auth/verify` | Compromise/replay = attacker can authenticate as the wallet owner |
| Google OAuth code/callback | `passport-google-oauth20` flow | Compromise = attacker links their session to victim's Google identity |
| Wallet address / room ownership | Polygon contract (Yogashree, in progress) | Compromise = unauthorized room control once decentralization layer ships |

Trust boundary: everything under `/api/*` is untrusted input until validated. The
frontend (Jaswanth's pieces) is also untrusted from the backend's point of view —
we don't assume the client behaves.

---

## 2. Threats and current mitigations

### 2.1 Credential stuffing / brute-force login
- **Threat:** automated repeated login attempts against `/api/auth/login`.
- **Mitigation (done):** `src/middleware/rateLimiter.js` applies
  `express-rate-limit` to all of `/api/auth/*` — default 10 requests / 15 min
  per IP, both configurable via `AUTH_RATE_LIMIT_MAX` /
  `AUTH_RATE_LIMIT_WINDOW_MS`. Tested in `tests/rateLimiter.test.js`.
- **Residual risk:** per-IP limiting doesn't stop a distributed (many-IP)
  attack, and shared NAT/corporate IPs can hit the limit legitimately. If this
  matters for the deployment, consider layering per-account attempt tracking
  on top of per-IP.

### 2.2 Email enumeration via forgot-password
- **Threat:** attacker submits emails to `/api/auth/forgot-password` to learn
  which addresses have accounts.
- **Mitigation (done):** the route always returns the same generic success
  message (`"If that email exists, a reset link has been sent."`) whether or
  not the user exists — see `routes/auth.js` and `tests/auth.test.js`.

### 2.3 Password reset token exposure / reuse
- **Threat:** reset token intercepted (e.g. from logs, referrer headers,
  email compromise) and reused.
- **Mitigation (done):** the raw token is only ever emailed to the user; the
  database stores a SHA-256 hash of it (`resetPasswordToken`), so a DB leak
  alone doesn't yield usable tokens. Tokens expire after 1 hour
  (`resetPasswordExpires`).
- **Residual risk:** tokens aren't single-use at the DB level beyond being
  cleared on success — if the reset succeeds, `resetPasswordToken` is nulled
  out (good), but there's no protection against two concurrent reset flows
  racing. Low priority given the 1-hour window and human-triggered nature of
  this flow.

### 2.4 Web3Auth idToken replay — **open risk**
- **Threat:** a captured Web3Auth `idToken` (e.g. via browser history, a
  malicious extension, or network interception on a misconfigured client) can
  be replayed against `/api/auth/web3auth/verify` repeatedly until it expires,
  since the endpoint only checks signature/issuer/audience/expiry — it does
  not track whether a given token has already been consumed.
- **Status:** **not yet mitigated.** This is the single biggest gap in the
  current design.
- **Recommended fix (for Nithin Sai / whoever owns `web3authVerifier.js`):**
  - Add a `POST /api/auth/web3auth/nonce` endpoint that issues a short-lived,
    single-use nonce the frontend must embed in the Web3Auth flow (or include
    alongside the idToken), OR
  - Maintain a short-lived "seen JTI" cache (in-memory or Redis) keyed on the
    token's `jti`/`sub`+`iat` claim, sized to the token's own expiry window,
    and reject any idToken whose identifier has already been consumed.
  - Until either lands, treat this as an accepted risk bounded by the token's
    natural expiry (check what TTL Web3Auth issues idTokens with — the
    shorter it is, the smaller this window).

### 2.5 CSRF on Google OAuth redirect
- **Threat:** classic OAuth CSRF — an attacker tricks a victim's browser into
  completing an OAuth flow with the attacker's account, potentially linking
  sessions incorrectly.
- **Status:** partially mitigated by `session: false` in the passport config
  (no server-side session to fixate), but there's **no explicit `state`
  parameter validation** in `routes/auth.js`'s `/google` /
  `/google/callback` handlers.
- **Recommendation:** passport-google-oauth20 supports a `state` option; wire
  it up so the callback verifies the state matches what was issued, rather
  than relying solely on the absence of sessions.

### 2.6 JWT handling
- **Mitigation (done):** tokens are signed with `JWT_SECRET`, include
  `id`/`name`/`email`, default expiry `7d` (`JWT_EXPIRES_IN`).
- **Recommendation:**
  - Confirm `JWT_SECRET` is a long random value in every environment (not a
    placeholder committed anywhere) — see `.env.example` in
    `ENV_SETUP.md`.
  - Confirm the frontend transmits it as `Authorization: Bearer <token>`
    (already what `middleware/auth.js` expects) rather than storing it
    somewhere XSS-exposed like `document.cookie` without `httpOnly`/`Secure`
    flags. **Flag to Jaswanth:** if `persistAuthSession` uses
    `localStorage`, any XSS on the frontend yields full account takeover —
    worth a deliberate decision (localStorage vs httpOnly cookie), not a
    default.
  - 7-day expiry is long for a token with no revocation list. If that's a
    concern for this project's grading/threat model, consider a shorter
    expiry + refresh token, or at minimum document it as an accepted
    tradeoff.

### 2.7 Excess data exposure
- **Mitigation (done):** `User.password` has `select: false` at the schema
  level and is stripped again in `toJSON`/`toObject` transforms and in
  `sanitizeUser()` before any response — so it can't leak via `/me`,
  `/register`, `/login`, or the Web3Auth route by accident.

### 2.8 Authorization for room/recording actions (decentralization layer)
- **Threat:** once Yogashree's Polygon contract integration lands
  (`isUserHost(address)` / `ownsRoom(roomId)`), a missing or bypassable check
  would let any authenticated user act as host/owner of any room.
- **Status:** not yet built — flagging now so it's tested when it lands.
- **Recommendation:** whatever middleware enforces this should be applied
  server-side before any state-changing route (start recording, end room,
  etc.), never trusted from client-supplied flags, and covered by its own
  unit tests (mocking the ethers/contract client the same way `User` is
  mocked here).

---

## 3. Secure defaults already in place (summary)

- Rate limiting on all `/api/auth/*` routes (10 req / 15 min per IP, default)
- Passwords hashed with bcrypt, never returned in any response
- Generic response on forgot-password (no email enumeration)
- Reset tokens hashed at rest, expire in 1 hour, single-use in practice
  (cleared after success or failed email send)
- `helmet` applied globally; CORS locked to `CLIENT_URL`
- JWT-based stateless auth (`middleware/auth.js`) gating `/me` and future
  protected routes

## 4. Open items / owners

| Item | Owner | Status |
|---|---|---|
| Web3Auth idToken replay protection (nonce or JTI cache) | Nithin Sai | Open |
| OAuth `state` parameter validation | Nithin Sai / whoever owns `passport.js` | Open |
| Token storage strategy on frontend (localStorage vs httpOnly cookie) | Jaswanth | Open — needs a decision, not just an implementation |
| Room/wallet authorization middleware + tests | Yogashree (build), Thanushree (test) | Blocked on contract deployment |
| Frontend smoke test (login → token stored → ProtectedRoute) | Thanushree | Blocked on Jaswanth's login component |
