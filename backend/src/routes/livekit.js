const express = require('express');
const { AccessToken } = require('livekit-server-sdk');
const auth = require('../middleware/auth');
const { verifyRoomOwnership } = require('../middleware/blockchainAuth');
const { createRoom, transferOwnership } = require('../services/blockchainService');

const router = express.Router();

/**
 * POST /api/livekit/token
 * Issues a LiveKit JWT for any authenticated participant joining a room.
 * No blockchain gate — any authenticated user can join.
 * body: { roomName, participantName }
 */
router.post('/token', auth, async (req, res) => {
  const { roomName, participantName } = req.body;

  if (!roomName || !participantName) {
    return res.status(400).json({ error: 'roomName and participantName are required' });
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    return res.status(500).json({ error: 'LiveKit credentials not configured' });
  }

  const token = new AccessToken(apiKey, apiSecret, {
    identity: participantName,
    ttl: '2h',
  });

  token.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  const jwt = await token.toJwt();
  return res.json({ token: jwt });
});

/**
 * POST /api/livekit/room
 * Registers a new room on-chain. The backend signer wallet becomes the owner.
 * Requires JWT auth only — no prior on-chain ownership needed (this IS the creation step).
 * body: { roomName }
 */
router.post('/room', auth, async (req, res) => {
  const { roomName } = req.body;

  if (!roomName) {
    return res.status(400).json({ success: false, message: 'roomName is required.' });
  }

  const walletAddress =
    req.user?.walletAddress || req.body?.walletAddress || null;

  try {
    const result = await createRoom(roomName, walletAddress);
    return res.status(201).json({ success: true, data: result });
  } catch (err) {
    if (err.message?.includes('room already exists')) {
      return res.status(200).json({ success: true, message: 'Room already registered on-chain.' });
    }
    console.error('[livekit] createRoom failed:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to register room on-chain.' });
  }
});

/**
 * POST /api/livekit/room/transfer
 * Transfers on-chain room ownership to a new wallet.
 * Requires JWT auth + on-chain ownership of the room (verifyRoomOwnership).
 * body: { roomName, newOwner }
 */
router.post('/room/transfer', auth, verifyRoomOwnership, async (req, res) => {
  const { newOwner } = req.body;

  if (!newOwner) {
    return res.status(400).json({ success: false, message: 'newOwner address is required.' });
  }

  try {
    const result = await transferOwnership(req.blockchainRoomId, newOwner);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error('[livekit] transferOwnership failed:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to transfer room ownership.' });
  }
});

module.exports = router;
