const jwt = require('jsonwebtoken');
const { failure } = require('../utils/response');

function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [type, token] = header.split(' ');

  if (type !== 'Bearer' || !token) {
    return failure(res, 'Unauthorized', null, 401);
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch (error) {
    return failure(res, 'Invalid token', null, 401);
  }
}

function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return failure(res, 'Forbidden', null, 403);
    }
    return next();
  };
}

module.exports = { authenticate, requireRoles };
