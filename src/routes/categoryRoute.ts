import express from "express";

import * as categoryController from "../controller/category";
import { validateProduct } from "../utils/validators/productValidator";

const router = express.Router();

router.route("/").get(categoryController.getAllCategories).post(categoryController.createCategory);

router
  .route("/:id")
  .get(categoryController.getCategoryById)
  .patch(validateProduct, categoryController.updateCategory)
  .delete(categoryController.deleteCategory);

router.route("/products").post(categoryController.addProductToCategory);

export default router;
