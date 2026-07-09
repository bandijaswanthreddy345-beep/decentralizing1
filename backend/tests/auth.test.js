const request = require('supertest');

jest.mock('../src/models/User', () => require('./mocks/User'));
jest.mock('bcryptjs');
jest.mock('@emailjs/nodejs');
// app.js -> routes/auth.js pulls this in even though these tests don't
// exercise the Web3Auth route; stub it so the real `jose` (ESM-only) package
// never gets required under Jest/CommonJS.
jest.mock('../src/services/web3authVerifier', () => ({
  verifyWeb3AuthToken: jest.fn(),
}));

const bcrypt = require('bcryptjs');
const emailjs = require('@emailjs/nodejs');
const User = require('../src/models/User');
const { createQuery, createFakeUser } = require('./mocks/User');
const app = require('../src/app');

describe('POST /api/auth/register', () => {
  it('registers a user successfully', async () => {
    User.findOne.mockResolvedValueOnce(null); // no existing user
    bcrypt.hash.mockResolvedValueOnce('hashed-password');
    User.create.mockResolvedValueOnce(
      createFakeUser({ name: 'Jane Doe', email: 'jane@example.com' })
    );

    const res = await request(app).post('/api/auth/register').send({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('jane@example.com');
    expect(res.body.data.user.password).toBeUndefined();
  });

  it('returns 400 when name is missing', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'jane@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 when email is missing', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Jane Doe',
      password: 'password123',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 when password is missing', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Jane Doe',
      email: 'jane@example.com',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 when the email is already registered', async () => {
    User.findOne.mockResolvedValueOnce(createFakeUser({ email: 'jane@example.com' }));

    const res = await request(app).post('/api/auth/register').send({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already exists/i);
  });
});

describe('POST /api/auth/login', () => {
  it('logs in successfully with correct credentials', async () => {
    const fakeUser = createFakeUser({
      email: 'jane@example.com',
      password: 'hashed-password',
    });
    User.findOne.mockReturnValueOnce(createQuery(fakeUser));
    bcrypt.compare.mockResolvedValueOnce(true);

    const res = await request(app).post('/api/auth/login').send({
      email: 'jane@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  it('returns 400 when email is missing', async () => {
    const res = await request(app).post('/api/auth/login').send({
      password: 'password123',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 when password is missing', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'jane@example.com',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 401 when the user is not found', async () => {
    User.findOne.mockReturnValueOnce(createQuery(null));

    const res = await request(app).post('/api/auth/login').send({
      email: 'missing@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('returns 401 when the password is wrong', async () => {
    const fakeUser = createFakeUser({
      email: 'jane@example.com',
      password: 'hashed-password',
    });
    User.findOne.mockReturnValueOnce(createQuery(fakeUser));
    bcrypt.compare.mockResolvedValueOnce(false);

    const res = await request(app).post('/api/auth/login').send({
      email: 'jane@example.com',
      password: 'wrong-password',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 when a Google-linked account tries a password login', async () => {
    const googleUser = createFakeUser({
      email: 'jane@example.com',
      password: null,
      authProvider: 'google',
    });
    User.findOne.mockReturnValueOnce(createQuery(googleUser));

    const res = await request(app).post('/api/auth/login').send({
      email: 'jane@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/google/i);
  });
});

describe('POST /api/auth/forgot-password', () => {
  it('returns 400 when email is missing', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns a generic success message for an unknown email', async () => {
    User.findOne.mockResolvedValueOnce(null);

    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'unknown@example.com' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/if that email exists/i);
  });

  it('sends the reset email successfully for a known user', async () => {
    const fakeUser = createFakeUser({ email: 'jane@example.com' });
    User.findOne.mockResolvedValueOnce(fakeUser);
    emailjs.send.mockResolvedValueOnce({ status: 200 });

    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'jane@example.com' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(emailjs.send).toHaveBeenCalledTimes(1);
    expect(fakeUser.save).toHaveBeenCalled();
  });
});

describe('POST /api/auth/reset-password/:token', () => {
  it('returns 400 when password is missing', async () => {
    const res = await request(app).post('/api/auth/reset-password/sometoken').send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 when password is too short', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password/sometoken')
      .send({ password: '123' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 for an invalid or expired token', async () => {
    User.findOne.mockResolvedValueOnce(null);

    const res = await request(app)
      .post('/api/auth/reset-password/bad-token')
      .send({ password: 'newpassword123' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/invalid or has expired/i);
  });

  it('resets the password successfully with a valid token', async () => {
    const fakeUser = createFakeUser({ email: 'jane@example.com' });
    User.findOne.mockResolvedValueOnce(fakeUser);
    bcrypt.hash.mockResolvedValueOnce('new-hashed-password');

    const res = await request(app)
      .post('/api/auth/reset-password/valid-token')
      .send({ password: 'newpassword123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(fakeUser.save).toHaveBeenCalled();
  });
});
