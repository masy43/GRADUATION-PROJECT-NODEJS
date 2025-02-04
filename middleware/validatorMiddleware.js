const { validationResult } = require("express-validator");

const validatorMiddleware = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorData = errors.array().map((error) => ({
      field: error.param, 
      message: error.msg, 
    }));

    const errorMessage = errorData.map((error) => error.message);

    return res.status(400).json({
      status: "fail",
      httpCode: 400, 
      data: { errors: errorData }, 
      message: errorMessage, 
    });
  }
  next();
};

module.exports = validatorMiddleware;
