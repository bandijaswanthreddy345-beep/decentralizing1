/**
 * Fake "database" for the User model.
 *
 * The real model (src/models/User.js) talks to MongoDB via Mongoose. In
 * tests we swap it out entirely with this object so that:
 *   - no test ever touches the shared MongoDB Atlas database
 *   - each test can control exactly what the "database" returns
 *
 * Usage in a test file:
 *   jest.mock('../src/models/User', () => require('./mocks/User'));
 *   const User = require('../src/models/User'); // now this fake object
 *
 *   User.findOne.mockResolvedValueOnce(null);           // "not found"
 *   User.create.mockResolvedValueOnce(createFakeUser()); // "created"
 */

// Mongoose queries are sometimes awaited directly (`await User.findOne(...)`)
// and sometimes chained (`await User.findOne(...).select('+password')`).
// createQuery() gives back something that supports both: it's a real
// Promise (so `await` on it just works) with a `.select()` method glued on
// that resolves to the same value.
const createQuery = (result) => {
  const query = Promise.resolve(result);
  query.select = jest.fn(() => Promise.resolve(result));
  return query;
};

// Builds a plain fake user "document" with a working save()/toObject(),
// close enough to a real Mongoose document for the routes under test.
const createFakeUser = (overrides = {}) => {
  const user = {
    _id: 'user_123',
    name: 'Test User',
    email: 'test@example.com',
    password: undefined,
    authProvider: 'local',
    web3authUserId: null,
    walletAddress: null,
    avatar: null,
    resetPasswordToken: null,
    resetPasswordExpires: null,
    ...overrides,
  };

  user.save = jest.fn().mockResolvedValue(user);
  user.toObject = jest.fn(() => {
    const { save, toObject, ...plain } = user;
    delete plain.password;
    return plain;
  });

  return user;
};

const User = {
  findOne: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  create: jest.fn(),
};

module.exports = User;
module.exports.createQuery = createQuery;
module.exports.createFakeUser = createFakeUser;
