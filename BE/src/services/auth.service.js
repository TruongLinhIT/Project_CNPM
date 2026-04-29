const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

function sanitizeUser(user) {
  return {
    user_id: user.user_id,
    username: user.username,
    full_name: user.full_name,
    role: user.role,
    created_at: user.created_at
  };
}

async function registerUser(payload) {
  const { username, password, full_name, role } = payload;

  if (!username || !password || !full_name || !role) {
    const err = new Error('Missing required fields');
    err.statusCode = 400;
    throw err;
  }

  const exists = await User.findOne({ where: { username } });
  if (exists) {
    const err = new Error('Username already exists');
    err.statusCode = 409;
    throw err;
  }

  const password_hash = await bcrypt.hash(password, 10);
  const user = await User.create({ username, password_hash, full_name, role });

  return sanitizeUser(user);
}

async function loginUser(payload) {
  const { username, password } = payload;

  if (!username || !password) {
    const err = new Error('Missing credentials');
    err.statusCode = 400;
    throw err;
  }

  const user = await User.findOne({ where: { username } });
  if (!user) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  const token = jwt.sign(
    {
      user_id: user.user_id,
      username: user.username,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );

  return { token, user: sanitizeUser(user) };
}

module.exports = { registerUser, loginUser };
