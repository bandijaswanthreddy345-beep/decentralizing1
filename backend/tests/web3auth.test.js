const request = require('supertest');

jest.mock('../src/models/User', () => require('./mocks/User'));
// Explicit factory: the real module pulls in `jose` (an ESM-only package),
// so automocking would still `require()` it and blow up under Jest/CommonJS.
jest.mock('../src/services/web3authVerifier', () => ({
  verifyWeb3AuthToken: jest.fn(),
}));

const User = require('../src/models/User');
const { createFakeUser } = require('./mocks/User');
const { verifyWeb3AuthToken } = require('../src/services/web3authVerifier');
const app = require('../src/app');

const ROUTE = '/api/auth/web3auth/verify';

describe('POST /api/auth/web3auth/verify - validation', () => {
  it('returns 400 when idToken is missing', async () => {
    const res = await request(app).post(ROUTE).send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 when idToken is null', async () => {
    const res = await request(app).post(ROUTE).send({ idToken: null });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 when idToken is an empty string', async () => {
    const res = await request(app).post(ROUTE).send({ idToken: '' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 when idToken is the wrong datatype', async () => {
    const res = await request(app).post(ROUTE).send({ idToken: 12345 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/auth/web3auth/verify - verification', () => {
  it('returns 401 when the token fails verification', async () => {
    verifyWeb3AuthToken.mockRejectedValueOnce(new Error('Web3Auth token verification failed'));

    const res = await request(app).post(ROUTE).send({ idToken: 'bad-token' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('logs in an existing Web3Auth user', async () => {
    verifyWeb3AuthToken.mockResolvedValueOnce({
      web3authUserId: 'w3a_123',
      email: 'jane@example.com',
      name: 'Jane Doe',
      profileImage: null,
      wallets: [],
    });

    const existingUser = createFakeUser({
      email: 'jane@example.com',
      web3authUserId: 'w3a_123',
      authProvider: 'web3auth',
    });
    User.findOne.mockResolvedValueOnce(existingUser);

    const res = await request(app).post(ROUTE).send({ idToken: 'valid-token' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(existingUser.save).toHaveBeenCalled();
    expect(User.create).not.toHaveBeenCalled();
  });

  it('links an existing account found by email when no web3authUserId match exists', async () => {
    verifyWeb3AuthToken.mockResolvedValueOnce({
      web3authUserId: 'w3a_456',
      email: 'jane@example.com',
      name: 'Jane Doe',
      profileImage: null,
      wallets: [],
    });

    const existingUser = createFakeUser({
      email: 'jane@example.com',
      web3authUserId: null,
      authProvider: 'local',
    });
    // First lookup (by web3authUserId) misses, second lookup (by email) hits.
    User.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(existingUser);

    const res = await request(app).post(ROUTE).send({ idToken: 'valid-token' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(existingUser.save).toHaveBeenCalled();
    expect(User.create).not.toHaveBeenCalled();
  });

  it('creates a new user when no existing account matches', async () => {
    verifyWeb3AuthToken.mockResolvedValueOnce({
      web3authUserId: 'w3a_789',
      email: 'new.user@example.com',
      name: 'New User',
      profileImage: null,
      wallets: [],
    });

    User.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    const newUser = createFakeUser({
      email: 'new.user@example.com',
      web3authUserId: 'w3a_789',
      authProvider: 'web3auth',
    });
    User.create.mockResolvedValueOnce(newUser);

    const res = await request(app).post(ROUTE).send({ idToken: 'valid-token' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(User.create).toHaveBeenCalledTimes(1);
    expect(res.body.data.user.email).toBe('new.user@example.com');
  });

  it('returns a valid JWT on successful login', async () => {
    const jwt = require('jsonwebtoken');

    verifyWeb3AuthToken.mockResolvedValueOnce({
      web3authUserId: 'w3a_123',
      email: 'jane@example.com',
      name: 'Jane Doe',
      profileImage: null,
      wallets: [],
    });

    const existingUser = createFakeUser({
      email: 'jane@example.com',
      web3authUserId: 'w3a_123',
      authProvider: 'web3auth',
    });
    User.findOne.mockResolvedValueOnce(existingUser);

    const res = await request(app).post(ROUTE).send({ idToken: 'valid-token' });

    expect(res.status).toBe(200);
    const decoded = jwt.verify(res.body.data.token, process.env.JWT_SECRET);
    expect(decoded.email).toBe('jane@example.com');
  });
});
