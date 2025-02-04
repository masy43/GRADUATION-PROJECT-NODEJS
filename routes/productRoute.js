const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
} = require("../controller/product");
const {
  getAllFavoriteProducts,
  toggleFavoriteStatus
} = require("../controller/addToFav");
const {
  recommendProducts 
} = require("../controller/recommendations");
const { validateProduct } = require("../utils/validators/productValidator");

router.route("/").get(getAllProducts).post(createProduct);

router
  .route("/:id")
  .get(validateProduct, getProduct)
  .patch(validateProduct, updateProduct)
  .delete(deleteProduct);

router
  .route("/search/:searchQuery")
  .get(searchProducts);


router.put("/toggleFavorite", toggleFavoriteStatus);


router
  .route("/fav/user/:firebaseId")
  .get(getAllFavoriteProducts);

router
  .route("/recommended/:firebaseId")
  .get(recommendProducts);


module.exports = router;
