const { verifyWeb3AuthToken } = require('../services/web3authVerifier');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const emailjs = require('@emailjs/nodejs');
const passport = require('passport');
const User = require('../models/User');
const auth = require('../middleware/auth');



const sendResetEmail = async (toEmail, toName, resetUrl) => {
  await emailjs.send(
    process.env.EMAILJS_SERVICE_ID,
    process.env.EMAILJS_TEMPLATE_ID,
    {
      to_email: toEmail,
      to_name:  toName || 'User',
      reset_url: resetUrl,
    },
    {
      publicKey:  process.env.EMAILJS_PUBLIC_KEY,
      privateKey: process.env.EMAILJS_PRIVATE_KEY,
    }
  );
};

const router = express.Router();

const signToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );

const sanitizeUser = (user) => {
  const plainUser = user.toObject ? user.toObject() : { ...user };
  delete plainUser.password;
  return plainUser;
};

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = signToken(user);

    return res.status(201).json({
      success: true,
      data: {
        token,
        user: sanitizeUser(user),
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'This account uses Google sign-in. Continue with Google to log in.',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const token = signToken(user);

    return res.json({
      success: true,
      data: {
        token,
        user: sanitizeUser(user),
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      // Return success regardless to avoid email enumeration
      return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const resetUrl = `${clientUrl}/reset-password/${rawToken}`;

    try {
      await sendResetEmail(user.email, user.name, resetUrl);
    } catch (emailErr) {
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();
      return res.status(500).json({ success: false, message: 'Failed to send reset email. Check SMTP config.' });
    }

    return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  } catch (error) {
    return next(error);
  }
});

router.post('/reset-password/:token', async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ success: false, message: 'New password is required.' });
    if (password.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Reset link is invalid or has expired.' });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.json({ success: true, message: 'Password reset successfully.' });
  } catch (error) {
    return next(error);
  }
});

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=google_auth_failed`,
  }),
  async (req, res) => {
    const token = signToken(req.user);
    const callbackUrl = new URL('/auth/callback', process.env.CLIENT_URL || 'http://localhost:3000');
    callbackUrl.searchParams.set('token', token);
    return res.redirect(callbackUrl.toString());
  }
);

router.get('/me', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    return res.json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.put('/me', auth, async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const updates = {};
    if (name && name.trim()) updates.name = name.trim();
    if (email && email.trim()) updates.email = email.trim().toLowerCase();

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true },
    );

    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    return res.json({ success: true, data: { user } });
  } catch (error) {
    return next(error);
  }
});

router.post('/web3auth/verify', async (req, res, next) => {
  console.log("==== WEB3AUTH VERIFY CALLED ====");
  try {
    const { idToken } = req.body;

    if (idToken === undefined) {
      return res.status(400).json({ success: false, message: 'idToken is required.' });
    }

    if (idToken === null) {
      return res.status(400).json({ success: false, message: 'idToken cannot be null.' });
    }

    if (typeof idToken !== 'string') {
      return res.status(400).json({ success: false, message: 'idToken must be a string.' });
    }

    if (idToken.trim() === '') {
      return res.status(400).json({ success: false, message: 'idToken cannot be empty.' });
    }

    let verifiedUser;
    try {
      verifiedUser = await verifyWeb3AuthToken(idToken);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: err.message,
      });
    }

    const {
      web3authUserId,
      email,
      name,
      profileImage,
      wallets,
    } = verifiedUser || {};

    const normalizedEmail = email ? email.trim().toLowerCase() : null;

    const walletAddress = (() => {
      const firstWallet = wallets?.[0];
      if (!firstWallet) return null;

      // Web3Auth wallet objects sometimes include:
      // - public_key
      // - publicKey
      // - publicAddress
      // - address
      const publicKey = firstWallet.public_key || firstWallet.publicKey;
      if (publicKey) return publicKey;

      const publicAddress = firstWallet.publicAddress || firstWallet.address;
      if (publicAddress) return publicAddress;

      // If wallets is already an array of strings
      if (typeof firstWallet === 'string') return firstWallet;

      return null;
    })();

    const baseUpdate = {
      authProvider: 'web3auth',
      web3authUserId: web3authUserId || null,
      walletAddress: walletAddress || null,
      avatar: profileImage || null,
      name: name || null,
      email: normalizedEmail || null,
    };

    // Find by web3authUserId first, otherwise by email.
    let user = null;
    if (web3authUserId) {
      user = await User.findOne({ web3authUserId });
    }

    if (!user && normalizedEmail) {
      user = await User.findOne({ email: normalizedEmail });
    }

    if (user) {
      // If email exists but web3authUserId is empty, link instead of creating a second user.
      const updates = {
        ...baseUpdate,
      };

      // Avoid overwriting name/email with null values.
      if (!updates.name) delete updates.name;
      if (!updates.email) delete updates.email;

      Object.assign(user, updates);
      await user.save();
    } else {
      if (!normalizedEmail) {
        return res.status(401).json({
          success: false,
          message: 'Verified user email is missing.',
        });
      }

      const createPayload = {
        name: name || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        authProvider: 'web3auth',
        web3authUserId: web3authUserId || null,
        walletAddress: walletAddress || null,
        avatar: profileImage || null,
      };

      user = await User.create(createPayload);
    }

    const token = signToken(user);

    return res.status(200).json({
      success: true,
      data: {
        token,
        user: sanitizeUser(user),
      },
    });
  } catch (error) {
    return next(error);
  }
});


module.exports = router;

