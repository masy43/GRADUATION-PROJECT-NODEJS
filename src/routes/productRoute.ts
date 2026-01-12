import express from "express";

import * as productController from "../controller/product";
import * as favController from "../controller/addToFav";
import * as recommendationsController from "../controller/recommendations";
import { validateProduct } from "../utils/validators/productValidator";

const router = express.Router();

router.route("/").get(productController.getAllProducts).post(productController.createProduct);

router
  .route("/:id")
  .get(validateProduct, productController.getProduct)
  .patch(validateProduct, productController.updateProduct)
  .delete(productController.deleteProduct);

router.route("/search/:searchQuery").get(productController.searchProducts);

router.put("/toggleFavorite", favController.toggleFavoriteStatus);

router.route("/fav/user/:firebaseId").get(favController.getAllFavoriteProducts);

router.route("/recommended/:firebaseId").get(recommendationsController.recommendProducts);

export default router;
