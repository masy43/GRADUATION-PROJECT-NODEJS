import type { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";

import AppError from "../utils/AppError";
import prisma from "../utils/prismaClient";

export const createOrder = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { firebaseId, address, phoneNumber } = req.body;

  if (!firebaseId) {
    next(new AppError("firebaseId is required", 400));
    return;
  }
  if (!address) {
    next(new AppError("address is required", 400));
    return;
  }
  if (!phoneNumber) {
    next(new AppError("phoneNumber is required", 400));
    return;
  }

  const userExists = await prisma.user.findUnique({ where: { firebaseId } });
  if (!userExists) {
    next(new AppError("User not found", 404));
    return;
  }

  const cart = await prisma.cart.findFirst({
    where: { firebaseId },
    include: { cartItems: { include: { product: true } } },
  });

  if (!cart) {
    next(new AppError("Cart not found", 404));
    return;
  }

  let totalAmount = 0;
  for (const cartItem of cart.cartItems) {
    totalAmount += cartItem.product.price * cartItem.quantity;
  }

  const order = await prisma.order.create({
    data: {
      date: new Date(),
      totalAmount,
      status: "Pending",
      user: { connect: { firebaseId } },
      orderItems: {
        createMany: {
          data: cart.cartItems.map((cartItem) => ({
            productId: cartItem.productId,
            quantity: cartItem.quantity,
            subtotal: cartItem.product.price * cartItem.quantity,
          })),
        },
      },
      address: { create: { address } },
      phoneNumber,
    },
  });

  await prisma.cartItem.deleteMany({ where: { cartId: cart.cartId } });

  res.status(201).json({ message: "Order created successfully", order });
});

export const getOrderById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const orderIdInt = parseInt(req.params.orderId, 10);
    if (Number.isNaN(orderIdInt)) {
      next(new AppError("Invalid orderId", 400));
      return;
    }

    const order = await prisma.order.findUnique({
      where: { orderId: orderIdInt },
      include: { user: true, orderItems: true, address: true },
    });

    if (!order) {
      next(new AppError("Order not found", 404));
      return;
    }

    res.status(200).json({ order });
  }
);

export const getOrdersByUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { firebaseId } = req.params;

    const user = await prisma.user.findUnique({ where: { firebaseId } });
    if (!user) {
      next(new AppError("User not found", 404));
      return;
    }

    const orders = await prisma.order.findMany({
      where: { firebaseId },
      include: { user: true, orderItems: true, address: true, shipping: true },
    });

    if (orders.length === 0) {
      next(new AppError("User has not made any orders", 404));
      return;
    }

    res.status(200).json({ orders });
  }
);

export const cancelOrder = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { firebaseId, orderId } = req.body;

  if (!firebaseId) {
    next(new AppError("firebaseId is required", 400));
    return;
  }
  if (!orderId) {
    next(new AppError("orderId is required", 400));
    return;
  }

  const orderIdInt = parseInt(String(orderId), 10);
  if (Number.isNaN(orderIdInt)) {
    next(new AppError("Invalid orderId", 400));
    return;
  }

  const order = await prisma.order.findFirst({
    where: {
      firebaseId,
      orderId: orderIdInt,
      status: "Pending",
    },
  });

  if (!order) {
    next(new AppError("Pending order not found for this user", 404));
    return;
  }

  await prisma.orderItem.deleteMany({ where: { orderId: order.orderId } });

  res.status(200).json({ message: "Order cancelled successfully" });
});

export const checkout = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { orderId, firebaseId } = req.body;

  if (!orderId) {
    next(new AppError("orderId is required", 400));
    return;
  }
  if (!firebaseId) {
    next(new AppError("firebaseId is required", 400));
    return;
  }

  const orderIdInt = parseInt(String(orderId), 10);
  if (Number.isNaN(orderIdInt)) {
    next(new AppError("Invalid orderId", 400));
    return;
  }

  const existing = await prisma.order.findUnique({ where: { orderId: orderIdInt } });
  if (!existing || existing.firebaseId !== firebaseId) {
    next(new AppError("Order not found for this user", 404));
    return;
  }

  const updatedOrder = await prisma.order.update({
    where: { orderId: orderIdInt },
    data: { status: "Completed" },
  });

  const newShipping = await prisma.shipping.create({
    data: {
      status: "Shipped",
      order: { connect: { orderId: orderIdInt } },
      shippingDate: new Date(),
    },
    include: { order: true },
  });

  res.status(200).json({
    message: "Checkout completed successfully",
    order: updatedOrder,
    shipping: newShipping,
  });
});
