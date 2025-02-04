const express = require("express");
const router = express.Router();
const categoryController = require("../controller/category");
const { validateProduct } = require("../utils/validators/productValidator");

router
  .route("/")
  .get(categoryController.getAllCategories)
  .post(categoryController.createCategory);

router
  .route("/:id")
  .get(categoryController.getCategoryById)
  .patch( validateProduct, categoryController.updateCategory)
  .delete(categoryController.deleteCategory)

router
  .route("/products")
  .post(categoryController.addProductToCategory);



module.exports = router;
