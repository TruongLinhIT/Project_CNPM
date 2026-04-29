const { success, failure } = require('../utils/response');
const { registerUser, loginUser } = require('../services/auth.service');

async function register(req, res) {
  try {
    const user = await registerUser(req.body);
    return success(res, 'User registered', user, 201);
  } catch (error) {
    return failure(res, error.message, error.details || null, error.statusCode || 500);
  }
}

async function login(req, res) {
  try {
    const result = await loginUser(req.body);
    return success(res, 'Login successful', result);
  } catch (error) {
    return failure(res, error.message, error.details || null, error.statusCode || 500);
  }
}

module.exports = { register, login };
