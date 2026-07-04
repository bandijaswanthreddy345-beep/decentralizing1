const { ownsRoom, isUserHost } = require("../services/blockchainService");

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Resolves roomId from the request.
 * Checks body.roomName (livekit token route) then params.roomId (REST routes).
 */
function resolveRoomId(req) {
  return req.body?.roomName || req.params?.roomId || null;
}

/**
 * Resolves the caller's Ethereum wallet address.
 * Spec-required resolution order:
 *   1. req.user.walletAddress  — embedded in JWT at login (preferred)
 *   2. req.body.walletAddress  — passed explicitly in request body (fallback)
 */
function resolveAddress(req) {
  return req.user?.walletAddress || req.body?.walletAddress || null;
}

/**
 * Shared guard — validates roomId and walletAddress are present.
 * Returns false and sends the response if validation fails.
 * Returns true if both are present and sets req.blockchainRoomId / req.blockchainAddress.
 */
function validateInputs(req, res) {
  const roomId = resolveRoomId(req);

  if (!roomId) {
    res.status(400).json({
      success: false,
      message: "roomId is required for blockchain verification.",
    });
    return false;
  }

  // Per spec task 5: missing wallet address → HTTP 401
  const walletAddress =
    req.user?.walletAddress || req.body?.walletAddress;

  if (!walletAddress) {
    res.status(401).json({
      success: false,
      message: "Wallet address is required. Link your wallet via PUT /api/auth/me/wallet.",
    });
    return false;
  }

  // Attach to req so the route handler can use them without re-resolving
  req.blockchainRoomId = roomId;
  req.blockchainAddress = walletAddress;
  return true;
}

// ─── Middleware ───────────────────────────────────────────────────────────────

/**
 * Verifies the authenticated user is the on-chain host of the room.
 * Must be placed AFTER the existing `auth` (JWT) middleware.
 *
 * 400 — roomId missing
 * 401 — wallet address not linked / not provided
 * 403 — caller is not the room host
 * 500 — blockchain node unreachable
 */
async function verifyHost(req, res, next) {
  if (!validateInputs(req, res)) return;

  try {
    const isHost = await isUserHost(req.blockchainRoomId, req.blockchainAddress);

    if (!isHost) {
      return res.status(403).json({
        success: false,
        message: "Access denied: you are not the host of this room.",
      });
    }

    return next();
  } catch (err) {
    console.error("[blockchainAuth] isHost check failed:", err.message);
    return res.status(500).json({
      success: false,
      message: "Blockchain verification failed. Please try again.",
    });
  }
}

/**
 * Verifies the authenticated user owns the requested room on-chain.
 * Must be placed AFTER the existing `auth` (JWT) middleware.
 *
 * 400 — roomId missing
 * 401 — wallet address not linked / not provided
 * 403 — caller does not own the room
 * 500 — blockchain node unreachable
 */
async function verifyRoomOwnership(req, res, next) {
  if (!validateInputs(req, res)) return;

  try {
    const isOwner = await ownsRoom(req.blockchainRoomId, req.blockchainAddress);

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: "Access denied: you do not own this room.",
      });
    }

    return next();
  } catch (err) {
    console.error("[blockchainAuth] ownsRoom check failed:", err.message);
    return res.status(500).json({
      success: false,
      message: "Blockchain verification failed. Please try again.",
    });
  }
}

module.exports = { verifyHost, verifyRoomOwnership };
