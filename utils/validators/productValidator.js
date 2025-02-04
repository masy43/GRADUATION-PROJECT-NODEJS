const { param } = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleware");

exports.validateProduct = [
  param("id").isInt().withMessage("Id must be an integer"),
  validatorMiddleware,
];
