const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
exports.generateJWT = asyncHandler(async (payload) => {
  const token = await jwt.sign({ payload }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  return token;
});
