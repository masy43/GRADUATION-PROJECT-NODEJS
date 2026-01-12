import express from "express";

import * as cartController from "../controller/cart";

const router = express.Router();

router.post("/add-item", cartController.addItemToCart);
router.delete("/remove-item/:itemId", cartController.removeItemFromCart);
router.put("/update-item/:itemId", cartController.updateItemQuantity);
router.get("/:firebaseId", cartController.viewCart);
router.delete("/clear/:firebaseId", cartController.clearCart);
router.post("/save/:firebaseId", cartController.saveCart);
router.put("/users/:firebaseId/products/:productId/toggleCart", cartController.toggleCartStatus);

export default router;
