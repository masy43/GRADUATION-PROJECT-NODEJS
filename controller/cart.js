const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const asyncHandler = require("express-async-handler");
const httpStatusText = require("../utils/httpStatusText");
const AppError = require("../utils/AppError");

exports.addItemToCart = asyncHandler(async (req, res, next) => {
  const { firebaseId, productId } = req.body;
  const defaultQuantity = 1;

  if (!firebaseId) {
    return next(new AppError("User doesn't exist", 401));
  }

  let cart = await prisma.cart.findFirst({
    where: { firebaseId: firebaseId },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { firebaseId: firebaseId },
    });
  }

  let existingCartItem = await prisma.cartItem.findFirst({
    where: { productId: productId, cartId: cart.cartId },
  });

  if (existingCartItem) {
    const updatedCartItem = await prisma.cartItem.update({
      where: { itemId: existingCartItem.itemId },
      data: { quantity: existingCartItem.quantity + 1 },
    });

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    const totalPrice = product.price * updatedCartItem.quantity;

    return res.status(200).json({
      status: httpStatusText.Success,
      message: "Quantity updated successfully",
      itemId: updatedCartItem.itemId,
      totalPrice: totalPrice,
    });
  } else {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return next(new AppError("Product not found", 404));
    }

    const cartItem = await prisma.cartItem.create({
      data: {
        quantity: defaultQuantity,
        productId: productId,
        cartId: cart.cartId,
      },
    });

    const totalPrice = product.price * defaultQuantity;

    return res.status(200).json({
      status: httpStatusText.Success,
      message: "Product added to cart successfully",
      cartItem,
      totalPrice: totalPrice,
    });
  }
});

exports.removeItemFromCart = asyncHandler(async (req, res, next) => {
  const { itemId } = req.params;
  const { firebaseId } = req.body;

  const cartItem = await prisma.cartItem.findUnique({
    where: { itemId: parseInt(itemId) },
    include: { cart: true },
  });

  if (!cartItem) {
    return next(new AppError("Item not found in cart", 404));
  }

  if (cartItem.cart.firebaseId !== firebaseId) {
    return next(new AppError("Unauthorized to delete item from cart", 403));
  }

  await prisma.cartItem.delete({
    where: { itemId: parseInt(itemId) },
  });

  res.status(200).json({
    status: httpStatusText.Success,
    message: "Item removed from cart successfully",
  });
});

exports.updateItemQuantity = asyncHandler(async (req, res, next) => {
  const { itemId } = req.params;
  const { quantity, firebaseId } = req.body; 

  const existingItem = await prisma.cartItem.findUnique({
    where: { itemId: parseInt(itemId) },
  });

  if (!existingItem) {
    return next(new AppError("Item not found", 404));
  }

  const cart = await prisma.cart.findFirst({
    where: { firebaseId: firebaseId },
    include: { cartItems: true },
  });

  const itemBelongsToUser = cart.cartItems.some(
    (item) => item.itemId === parseInt(itemId)
  );
  if (!itemBelongsToUser) {
    return next(new AppError("Unauthorized to update item quantity", 403));
  }

  await prisma.cartItem.update({
    where: { itemId: parseInt(itemId) },
    data: { quantity: quantity },
  });

  res.status(200).json({ message: "Item quantity updated successfully" });
});

exports.viewCart = asyncHandler(async (req, res, next) => {
  const firebaseId = req.params.firebaseId;

  const cart = await prisma.cart.findFirst({
    where: {
      firebaseId: firebaseId,
    },
    include: {
      user: true,
      cartItems: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

   const cartItemsWithTotalPrice = cart.cartItems.map((cartItem) => ({
     ...cartItem,
     totalPrice: cartItem.product.price * cartItem.quantity,
   }));
  
  res.status(200).json({
    status: httpStatusText.Success,
    cart: cartItemsWithTotalPrice
  });
});

exports.clearCart = asyncHandler(async (req, res, next) => {
  const firebaseId = req.params.firebaseId;

  const cart = await prisma.cart.findFirst({
    where: { firebaseId: firebaseId },
  });

  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  const cartId = cart.cartId;

  await prisma.cartItem.deleteMany({
    where: { cartId: cartId },
  });

  await prisma.cart.delete({
    where: { cartId: cartId },
  });

  res.status(200).json({ message: "Cart cleared successfully" });
});

exports.saveCart = asyncHandler(async (req, res, next) => {
  const firebaseId = req.params.firebaseId;

  const cart = await prisma.cart.findFirst({
    where: {
      firebaseId: firebaseId,
    },
    include: {
      cartItems: true,
    },
  });

  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  const savedCartItems = await prisma.savedCartItem.createMany({
    data: cart.cartItems.map((cartItem) => ({
      productId: cartItem.productId,
      quantity: cartItem.quantity,
      firebaseId: firebaseId,
    })),
  });

  res.status(201).json({ message: "Cart saved successfully", savedCartItems });
});

exports.toggleCartStatus = asyncHandler(async (req, res, next) => {
  const { firebaseId, productId } = req.params;

  const user = await prisma.user.findUnique({
    where: {
      firebaseId: firebaseId,
    },
  });

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const product = await prisma.product.findUnique({
    where: {
      id: parseInt(productId),
    },
  });

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  const updatedProduct = await prisma.product.update({
    where: {
      id: parseInt(productId),
    },
    data: {
      isCart: !product.isCart,
    },
  });

  res.status(200).json({
    status: httpStatusText.Success,
    isCart: updatedProduct.isCart,
  });
});

