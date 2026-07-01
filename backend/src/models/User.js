const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    authProvider: {
      type: String,
      enum: ['local', 'google', 'web3auth'],
      default: 'local',
    },
    googleId: {
      type: String,
      default: null,
    },
    // Optional fields for Web3Auth users
    web3authUserId: {
      type: String,
      default: null,
    },
    walletAddress: {
      type: String,
      default: null,
    },
    password: {
      type: String,
      required() {
        return this.authProvider === 'local';
      },
      select: false,
      default: null,
    },
    avatar: {
      type: String,
      default: null,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

const removeSensitiveFields = (_doc, ret) => {
  delete ret.password;
  return ret;
};

userSchema.set('toJSON', { transform: removeSensitiveFields });
userSchema.set('toObject', { transform: removeSensitiveFields });

module.exports = mongoose.model('User', userSchema);
