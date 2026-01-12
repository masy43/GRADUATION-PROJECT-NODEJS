import { param } from "express-validator";

import validatorMiddleware from "../../middleware/validatorMiddleware";

export const validateProduct = [param("id").isInt().withMessage("Id must be an integer"), validatorMiddleware];
