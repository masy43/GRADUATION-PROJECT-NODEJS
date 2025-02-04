const express = require("express");
const router = express.Router();
const cartController = require("../controller/cart");

router.post("/add-item", cartController.addItemToCart);
router.delete("/remove-item/:itemId", cartController.removeItemFromCart);
router.put("/update-item/:itemId" ,cartController.updateItemQuantity);
router.get("/:firebaseId", cartController.viewCart);
router.delete("/clear/:firebaseId", cartController.clearCart);
router.post("/save/:firebaseId", cartController.saveCart);
router.put("/users/:firebaseId/products/:productId/toggleCart",cartController.toggleCartStatus);


module.exports = router;
