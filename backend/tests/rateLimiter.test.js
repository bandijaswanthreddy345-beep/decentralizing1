const request = require('supertest');

const ORIGINAL_ENV = process.env;

describe('Auth rate limiter middleware', () => {
  let app;

  beforeEach(() => {
    // Fresh module registry per test so the limiter's in-memory request
    // log (and the app that wires it in) always starts empty.
    jest.resetModules();

    process.env = {
      ...ORIGINAL_ENV,
      NODE_ENV: 'test',
      JWT_SECRET: 'test-jwt-secret',
      AUTH_RATE_LIMIT_WINDOW_MS: '60000',
      AUTH_RATE_LIMIT_MAX: '3',
    };

    jest.doMock('../src/models/User', () => require('./mocks/User'));
    // Avoid pulling in the real `jose` (ESM-only) package via routes/auth.js.
    jest.doMock('../src/services/web3authVerifier', () => ({
      verifyWeb3AuthToken: jest.fn(),
    }));
    app = require('../src/app');
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('allows the first request through', async () => {
    const res = await request(app).post('/api/auth/login').send({});

    expect(res.status).not.toBe(429);
  });

  it('allows requests up to the configured limit', async () => {
    for (let i = 0; i < 3; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const res = await request(app).post('/api/auth/login').send({});
      expect(res.status).not.toBe(429);
    }
  });

  it('returns 429 for the request after the limit is exceeded', async () => {
    for (let i = 0; i < 3; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await request(app).post('/api/auth/login').send({});
    }

    const res = await request(app).post('/api/auth/login').send({});

    expect(res.status).toBe(429);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toEqual(
      expect.stringContaining('Too many authentication requests.')
    );
  });
});
