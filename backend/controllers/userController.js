const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// @desc    Register New User
// @route   POST /api/users/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { username, password, passwordConfirm } = req.body;

  if (!username || !password || !passwordConfirm) {
    res.status(400);
    throw new Error('Please add all fields');
  }

  // Check if user exists
  const userExists = await User.findOne({ username });

  if (userExists) {
    res.status(400);
    throw new Error('Username already exists');
  }
  if (password !== passwordConfirm) {
    res.status(400);
    throw new Error("Password and password confirmation not matched");
  }

  // Hash Password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create User
  const user = await User.create({
    username,
    password: hashedPassword
  });

  if (user) {
    res.status(201).json({
      id: user._id,
      usename: user.username,
      token: generateToken({ id: user._id })
    });
  } else {
    res.status(400);
    throw new Error('Invalid Credentials');
  }
});

// @desc    Authenticate a User
// @route   POST /api/users/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // Check for user email
  const user = await User.findOne({ username });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.status(200).json({
      id: user._id,
      username: user.username,
      token: generateToken({ id: user._id })
    });
  } else {
    res.status(400);
    throw new Error('Invalid Credentials');
  }
});

// @desc    Get user data
// @route   GET /api/users/me
// @access  Private
const me = asyncHandler(async (req, res) => {
  res.status(200).json(req.user);
});

// Generate JWT
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
}

module.exports = {
  register,
  login,
  me,
};
