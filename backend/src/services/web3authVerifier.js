const { createRemoteJWKSet, jwtVerify } = require('jose');

// Web3Auth Citadel JWKS endpoint for verifying idToken signatures
const JWKS_URL = 'https://api.web3auth.io/citadel-service/.well-known/jwks.json';

// jose remote JWKS fetcher (cached internally)
const jwks = createRemoteJWKSet(new URL(JWKS_URL));

async function verifyWeb3AuthToken(idToken) {
  if (typeof idToken !== 'string' || idToken.trim() === '') {
    throw new Error('Invalid idToken');
  }

  const audience = process.env.WEB3AUTH_CLIENT_ID;
  if (!audience) {
    throw new Error('WEB3AUTH_CLIENT_ID is not configured');
  }

  const issuer = 'web3auth.io';

  let verified;
  try {
    verified = await jwtVerify(idToken, jwks, {
      issuer,
      audience,
    });
  } catch (err) {
    // jose throws for signature/issuer/audience/expiry/etc.
    throw new Error(`Web3Auth token verification failed: ${err?.message || err}`);
  }

  const payload = verified.payload || {};

  // Web3Auth idToken typically includes these claims.
  // Some fields may be absent depending on the login method.
  const web3authUserId = payload.sub || payload.web3authUserId || payload.userId;

  const email = payload.email;
  const name = payload.name || payload.given_name || payload.full_name;

  // Common variations seen in Web3Auth profiles
  const profileImage =
    payload.picture || payload.profileImage || payload.avatar || payload.profile_picture;

  // Wallets claim may appear as:
  // - wallets: array
  // - walletAddress / publicAddress: string
  const wallets =
    payload.wallets ||
    (payload.walletAddress ? [payload.walletAddress] : payload.publicAddress ? [payload.publicAddress] : []);

  return {
    web3authUserId,
    email,
    name,
    profileImage,
    wallets,
  };
}

module.exports = { verifyWeb3AuthToken };

