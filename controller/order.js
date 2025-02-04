const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const asyncHandler = require("express-async-handler");
const httpStatusText = require("../utils/httpStatusText");
const AppError = require("../utils/AppError");

exports.createOrder = asyncHandler(async (req, res, next) => {
  const { firebaseId, address, phoneNumber } = req.body;

  const userExists = await prisma.user.findUnique({
    where: { firebaseId: firebaseId },
  });

  if (!userExists) {
    return next(new AppError("User not found", 404));
  }

  const cart = await prisma.cart.findFirst({
    where: { firebaseId: firebaseId },
    include: { cartItems: { include: { product: true } } },
  });

  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  let totalAmount = 0;
  for (const cartItem of cart.cartItems) {
    totalAmount += cartItem.product.price * cartItem.quantity;
  }

  const order = await prisma.order.create({
    data: {
      date: new Date(),
      totalAmount: totalAmount,
      status: "Pending",
      user: {
        connect: { firebaseId: firebaseId },
      },
      orderItems: {
        createMany: {
          data: cart.cartItems.map((cartItem) => ({
            productId: cartItem.productId,
            quantity: cartItem.quantity,
            subtotal: cartItem.product.price * cartItem.quantity,
          })),
        },
      },
      address: { create: { address: address } },
      phoneNumber: phoneNumber,
    },
  });

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

  res.status(201).json({ message: "Order created successfully", order });
});


exports.getOrderById = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;

  const order = await prisma.order.findUnique({
    where: { orderId: parseInt(orderId) },
    include: {
      user: true,
      orderItems: true,
      address: true,
    },
  });

  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  res.status(200).json({ order });
});

exports.getOrdersByUser = asyncHandler(async (req, res, next) => {
  const { firebaseId } = req.params;

  const user = await prisma.user.findUnique({
    where: { firebaseId: firebaseId },
  });

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const orders = await prisma.order.findMany({
    where: { firebaseId: firebaseId }, 
    include: {
      user: true,
      orderItems: true,
      address: true,
      shipping: true,
    },
  });

  if (orders.length === 0) {
    return next(new AppError("User has not made any orders", 404));
  }

  res.status(200).json({ orders });
});


exports.cancelOrder = asyncHandler(async (req, res, next) => {
  const { firebaseId, orderId } = req.body;

  const order = await prisma.order.findFirst({
    where: {
      firebaseId: firebaseId,
      orderId: parseInt(orderId),
      status: "Pending",
    },
  });

  if (!order) {
    return next(new AppError("Pending order not found for this user", 404));
  }

   await prisma.orderItem.deleteMany({
     where: {
       orderId: order.id,
     },
   });

  res
    .status(200)
    .json({ message: "Order cancelled successfully"});
});

exports.checkout = asyncHandler(async (req, res, next) => {
  const { orderId, firebaseId } = req.body;

  const updatedOrder = await prisma.order.update({
    where: { orderId: orderId, firebaseId: firebaseId },
    data: { status: "Completed" },
  });

  if (!updatedOrder) {
    return next(new AppError("Order not found for this user", 404));
  }

  const today = new Date();
  const newShipping = await prisma.shipping.create({
    data: {
      status: "Shipped",
      order: { connect: { orderId: orderId } },
      shippingDate: today,
    },
    include: { order: true },
  });

  res.status(200).json({
    message: "Checkout completed successfully",
    order: updatedOrder,
    shipping: newShipping,
  });
});






