import express from "express";

import * as orderController from "../controller/order";

const router = express.Router();

router.post("/create", orderController.createOrder);
router.get("/users/:firebaseId", orderController.getOrdersByUser);
router.get("/:orderId", orderController.getOrderById);
router.delete("/cancel", orderController.cancelOrder);
router.post("/checkout", orderController.checkout);

export default router;
