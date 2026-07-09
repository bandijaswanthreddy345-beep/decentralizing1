# Auth Providers — How Each Works and How Users Get Mapped

EtherXMeet supports three ways to authenticate. All three ultimately produce
the same thing: a `User` document in MongoDB and a signed JWT the client
attaches as `Authorization: Bearer <token>` on subsequent requests. This doc
explains each provider's flow and, importantly, how the backend decides
"is this an existing user or a new one?" for each.

Relevant files: `src/routes/auth.js`, `src/models/User.js`,
`src/config/passport.js`, `src/services/web3authVerifier.js`,
`src/middleware/auth.js`.

## The `User` schema, provider-relevant fields

| Field | Used by | Notes |
|---|---|---|
| `email` | all providers | Unique. Normalized to lowercase + trimmed everywhere it's read/written. |
| `authProvider` | all | Enum: `'local'`, `'google'`, `'web3auth'`. Records how the account was created/last used. |
| `password` | local only | bcrypt hash. `select: false` — never returned by default, and required only when `authProvider === 'local'`. |
| `googleId` | google | Google's stable profile ID. |
| `web3authUserId` | web3auth | Web3Auth's stable user ID (`sub` claim from the idToken). |
| `walletAddress` | web3auth | Extracted wallet address if the idToken includes one. |
| `avatar` | google, web3auth | Profile picture URL if provided by the identity provider. |
| `resetPasswordToken` / `resetPasswordExpires` | local | Hashed reset token + expiry, only relevant to password-based accounts. |

A single email can only ever back **one** `User` document — see "cross-provider
linking" below for what happens when the same email shows up via a different
provider.

---

## 1. Local (email + password)

**Register** — `POST /api/auth/register`
1. Requires `name`, `email`, `password`; 400 if any are missing.
2. Checks `User.findOne({ email })` — 400 `"Email already exists."` if found.
3. Hashes password with bcrypt (10 rounds), creates the user with
   `authProvider` defaulting to `'local'`.
4. Signs and returns a JWT + sanitized user (no password field).

**Login** — `POST /api/auth/login`
1. Requires `email`, `password`; 400 if missing.
2. Looks up the user with `.select('+password')` (password is normally
   excluded, so it has to be explicitly requested here).
3. If no user → 401 `"Invalid credentials"`.
4. If the user has no password set (i.e. they signed up via Google/Web3Auth)
   → 400 pointing them at Google sign-in. This is how we prevent a
   Google/Web3Auth-only account from being brute-forced via a password it
   never had.
5. `bcrypt.compare` the submitted password against the hash → 401 on
   mismatch.
6. On success, sign and return a JWT.

**Forgot / reset password**
- `POST /api/auth/forgot-password`: always returns the same generic message
  regardless of whether the email exists (prevents enumeration). If it does
  exist, generates a random token, stores its SHA-256 hash + 1-hour expiry,
  and emails the *raw* token via EmailJS.
- `POST /api/auth/reset-password/:token`: hashes the incoming token and looks
  up a user with a matching, non-expired `resetPasswordToken`. Requires the
  new password to be ≥6 characters. On success, updates the password hash and
  clears the reset fields.

---

## 2. Google OAuth

Handled by Passport's `passport-google-oauth20` strategy
(`src/config/passport.js`), wired to `session: false` (we don't use
server-side sessions — everything downstream is JWT-based).

**Flow**
1. Frontend redirects to `GET /api/auth/google`, which kicks off the OAuth
   dance (`passport.authenticate('google', { scope: ['profile', 'email'] })`).
2. Google redirects back to `GET /api/auth/google/callback`.
3. Inside the strategy's verify callback:
   - Looks up `User.findOne({ $or: [{ googleId }, { email }] })` — matches on
     **either** an existing Google-linked account or an existing account with
     the same email (see cross-provider linking below).
   - If no match: creates a new user with `authProvider: 'google'`.
   - If a match exists but doesn't have `googleId` set yet, or has a
     different `authProvider`: links it — sets `googleId`, flips
     `authProvider` to `'google'`, backfills `avatar` if missing.
4. On success, the callback route signs a JWT and redirects the browser to
   `${CLIENT_URL}/auth/callback?token=<jwt>` for the frontend to pick up.
5. On failure, redirects to `${CLIENT_URL}/login?error=google_auth_failed`.

Configuration is optional — if `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`/
`GOOGLE_CALLBACK_URL` aren't set, `configurePassport()` skips registering the
strategy and logs a warning; the rest of the app keeps working.

---

## 3. Web3Auth

`POST /api/auth/web3auth/verify` — this is the newest provider and the one
most of this sprint's work concentrated on.

**Request validation** (before any verification happens):
- `idToken` missing → 400
- `idToken === null` → 400
- `idToken` not a string → 400
- `idToken` empty/whitespace → 400

**Verification** (`src/services/web3authVerifier.js`):
- Verifies the idToken's signature against Web3Auth's remote JWKS
  (`https://api.web3auth.io/citadel-service/.well-known/jwks.json`), and
  checks `issuer: 'web3auth.io'` and `audience: WEB3AUTH_CLIENT_ID`.
- On any verification failure (bad signature, wrong audience, expired, etc.)
  the route returns 401 with the underlying error message.
- On success, extracts: `web3authUserId` (from `sub`), `email`, `name`,
  `profileImage`, and `wallets` (handles a few different shapes Web3Auth may
  send: `public_key`, `publicKey`, `publicAddress`, `address`, or a plain
  string).

**User mapping logic** — this is the part worth understanding carefully:
1. If the verified token has a `web3authUserId`, look up
   `User.findOne({ web3authUserId })` first.
2. If that misses **and** there's an email, fall back to
   `User.findOne({ email })`. This is the cross-provider linking case: e.g.
   someone who registered locally with `jane@example.com` and later logs in
   with Web3Auth using the same email gets **linked**, not duplicated.
3. If a user was found (by either lookup): update it in place —
   `authProvider` becomes `'web3auth'`, `web3authUserId`/`walletAddress`/
   `avatar` get set (without clobbering an existing `name`/`email` with a
   null value), then `.save()`.
4. If no user was found at all: requires a non-null email (401 if the
   verified token didn't include one — we can't create an account with no
   identifier), then creates a new user with `authProvider: 'web3auth'`.
5. Either way, signs and returns a JWT + sanitized user.

**Known gap:** this endpoint currently has no replay protection — a captured
idToken can be reused until it naturally expires. See `THREAT_MODEL.md`
§2.4 for the recommended fix and who owns it.

---

## Cross-provider linking, summarized

Because every provider ultimately keys off `email`, the *same* email can move
between providers over time:

- Register locally with `jane@example.com` → `authProvider: 'local'`.
- Later sign in with Google using the same email → the Google strategy finds
  the existing user by email, links `googleId`, and flips
  `authProvider: 'google'`. **The local password still exists on the
  document** (nothing clears it) — so `jane@example.com` could technically
  still log in with her old password afterward, even though her account is
  now "Google-flavored." This is a product decision, not a bug, but worth
  flagging to the team: if that's not the intended behavior, `authProvider`
  should probably gate which login methods are accepted, not just record the
  most recent one.
- Same pattern applies for Web3Auth linking onto an existing local/Google
  account by email.

## JWT payload (all providers)

Every `signToken(user)` call produces the same shape:
```json
{
  "id": "<mongo _id>",
  "name": "<user name>",
  "email": "<user email>",
  "iat": ...,
  "exp": ...
}
```
`middleware/auth.js` verifies this on any route using the `auth` middleware
(currently `/me` GET/PUT) and attaches the decoded payload as `req.user`.

**Open item:** the JWT does not currently include `walletAddress`. If
downstream features (e.g. the Polygon `isUserHost(address)` check) need the
wallet address without a fresh DB lookup, `signToken` would need to include
it — flag this to Nithin Sai if Yogashree's contract-check middleware ends up
wanting it directly off the token.
