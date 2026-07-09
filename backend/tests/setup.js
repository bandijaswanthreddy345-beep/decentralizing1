process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

// A generous default so functional tests (auth.test.js, web3auth.test.js)
// don't trip the rate limiter just from firing off many requests in a row.
// rateLimiter.test.js overrides this itself to test the limiter directly.
process.env.AUTH_RATE_LIMIT_MAX = process.env.AUTH_RATE_LIMIT_MAX || '1000';

// Every test file's mocks (User.findOne, bcrypt.compare, etc.) get reset
// before each test so results from one test can never leak into the next.
beforeEach(() => {
  jest.clearAllMocks();
});
