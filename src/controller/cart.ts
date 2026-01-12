import type { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";

import AppError from "../utils/AppError";
import httpStatusText from "../utils/httpStatusText";
import prisma from "../utils/prismaClient";

export const addItemToCart = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { firebaseId, productId } = req.body;
    const defaultQuantity = 1;

    if (!firebaseId) {
      next(new AppError("firebaseId is required", 400));
      return;
    }

    if (!productId) {
      next(new AppError("productId is required", 400));
      return;
    }

    const productIdInt = parseInt(String(productId), 10);
    if (Number.isNaN(productIdInt)) {
      next(new AppError("Invalid productId", 400));
      return;
    }

    let cart = await prisma.cart.findFirst({ where: { firebaseId } });

    if (!cart) {
      cart = await prisma.cart.create({ data: { firebaseId } });
    }

    const existingCartItem = await prisma.cartItem.findFirst({
      where: { productId: productIdInt, cartId: cart.cartId },
    });

    if (existingCartItem) {
      const updatedCartItem = await prisma.cartItem.update({
        where: { itemId: existingCartItem.itemId },
        data: { quantity: existingCartItem.quantity + 1 },
      });

      const product = await prisma.product.findUnique({ where: { id: productIdInt } });
      if (!product) {
        next(new AppError("Product not found", 404));
        return;
      }

      const totalPrice = product.price * updatedCartItem.quantity;

      res.status(200).json({
        status: httpStatusText.Success,
        message: "Quantity updated successfully",
        itemId: updatedCartItem.itemId,
        totalPrice,
      });
      return;
    }

    const product = await prisma.product.findUnique({ where: { id: productIdInt } });
    if (!product) {
      next(new AppError("Product not found", 404));
      return;
    }

    const cartItem = await prisma.cartItem.create({
      data: {
        quantity: defaultQuantity,
        productId: productIdInt,
        cartId: cart.cartId,
      },
    });

    const totalPrice = product.price * defaultQuantity;

    res.status(200).json({
      status: httpStatusText.Success,
      message: "Product added to cart successfully",
      cartItem,
      totalPrice,
    });
  }
);

export const removeItemFromCart = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { firebaseId } = req.body;

    if (!firebaseId) {
      next(new AppError("firebaseId is required", 400));
      return;
    }

    const itemIdInt = parseInt(req.params.itemId, 10);
    if (Number.isNaN(itemIdInt)) {
      next(new AppError("Invalid itemId", 400));
      return;
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { itemId: itemIdInt },
      include: { cart: true },
    });

    if (!cartItem) {
      next(new AppError("Item not found in cart", 404));
      return;
    }

    if (cartItem.cart.firebaseId !== firebaseId) {
      next(new AppError("Unauthorized to delete item from cart", 403));
      return;
    }

    await prisma.cartItem.delete({ where: { itemId: itemIdInt } });

    res.status(200).json({
      status: httpStatusText.Success,
      message: "Item removed from cart successfully",
    });
  }
);

export const updateItemQuantity = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { quantity, firebaseId } = req.body;

    if (!firebaseId) {
      next(new AppError("firebaseId is required", 400));
      return;
    }

    const itemIdInt = parseInt(req.params.itemId, 10);
    if (Number.isNaN(itemIdInt)) {
      next(new AppError("Invalid itemId", 400));
      return;
    }

    const quantityInt = parseInt(String(quantity), 10);
    if (Number.isNaN(quantityInt) || quantityInt < 1) {
      next(new AppError("quantity must be a positive integer", 400));
      return;
    }

    const existingItem = await prisma.cartItem.findUnique({ where: { itemId: itemIdInt } });
    if (!existingItem) {
      next(new AppError("Item not found", 404));
      return;
    }

    const cart = await prisma.cart.findFirst({
      where: { firebaseId },
      include: { cartItems: true },
    });
    if (!cart) {
      next(new AppError("Cart not found", 404));
      return;
    }

    const itemBelongsToUser = cart.cartItems.some((item) => item.itemId === itemIdInt);
    if (!itemBelongsToUser) {
      next(new AppError("Unauthorized to update item quantity", 403));
      return;
    }

    await prisma.cartItem.update({
      where: { itemId: itemIdInt },
      data: { quantity: quantityInt },
    });

    res.status(200).json({
      status: httpStatusText.Success,
      message: "Item quantity updated successfully",
    });
  }
);

export const viewCart = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { firebaseId } = req.params;

  const cart = await prisma.cart.findFirst({
    where: { firebaseId },
    include: {
      user: true,
      cartItems: { include: { product: true } },
    },
  });

  if (!cart) {
    next(new AppError("Cart not found", 404));
    return;
  }

  const cartItemsWithTotalPrice = cart.cartItems.map((cartItem) => ({
    ...cartItem,
    totalPrice: cartItem.product.price * cartItem.quantity,
  }));

  res.status(200).json({
    status: httpStatusText.Success,
    cart: cartItemsWithTotalPrice,
  });
});

export const clearCart = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { firebaseId } = req.params;

  if (!firebaseId) {
    next(new AppError("firebaseId is required", 400));
    return;
  }

  const cart = await prisma.cart.findFirst({ where: { firebaseId } });
  if (!cart) {
    next(new AppError("Cart not found", 404));
    return;
  }

  await prisma.cartItem.deleteMany({ where: { cartId: cart.cartId } });
  await prisma.cart.delete({ where: { cartId: cart.cartId } });

  res.status(200).json({
    status: httpStatusText.Success,
    message: "Cart cleared successfully",
  });
});

export const saveCart = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { firebaseId } = req.params;

  if (!firebaseId) {
    next(new AppError("firebaseId is required", 400));
    return;
  }

  const cart = await prisma.cart.findFirst({
    where: { firebaseId },
    include: { cartItems: true },
  });

  if (!cart) {
    next(new AppError("Cart not found", 404));
    return;
  }

  const savedCartItems = await prisma.savedCartItem.createMany({
    data: cart.cartItems.map((cartItem) => ({
      productId: cartItem.productId,
      quantity: cartItem.quantity,
      firebaseId,
    })),
  });

  res.status(201).json({
    status: httpStatusText.Success,
    message: "Cart saved successfully",
    savedCartItems,
  });
});

export const toggleCartStatus = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { firebaseId, productId } = req.params;

    if (!firebaseId) {
      next(new AppError("firebaseId is required", 400));
      return;
    }

    if (!productId) {
      next(new AppError("productId is required", 400));
      return;
    }

    const productIdInt = parseInt(productId, 10);
    if (Number.isNaN(productIdInt)) {
      next(new AppError("Invalid productId", 400));
      return;
    }

    const user = await prisma.user.findUnique({ where: { firebaseId } });
    if (!user) {
      next(new AppError("User not found", 404));
      return;
    }

    const product = await prisma.product.findUnique({ where: { id: productIdInt } });
    if (!product) {
      next(new AppError("Product not found", 404));
      return;
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productIdInt },
      data: { isCart: !product.isCart },
    });

    res.status(200).json({
      status: httpStatusText.Success,
      isCart: updatedProduct.isCart,
    });
  }
);
