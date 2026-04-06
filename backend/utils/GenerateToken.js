const jwt = require("jsonwebtoken");

exports.generateToken = (payload, passwordReset = false) => {
  // 🚨 FIX: Changed from SECRET_KEY to JWT_SECRET to match verifyToken.js
  const secretKey = process.env.JWT_SECRET;

  const expiresIn = passwordReset
    ? process.env.PASSWORD_RESET_TOKEN_EXPIRATION
    : process.env.LOGIN_TOKEN_EXPIRATION;

  return jwt.sign(payload, secretKey, { expiresIn });
};
