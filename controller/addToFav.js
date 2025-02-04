const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const asyncHandler = require("express-async-handler");
const httpStatusText = require("../utils/httpStatusText");
const AppError = require("../utils/AppError");


exports.toggleFavoriteStatus = asyncHandler(async (req, res, next) => {
  const { firebaseId, productId } = req.body;

  const user = await prisma.user.findUnique({
    where: {
      firebaseId: firebaseId,
    },
  });

  if (!user) {
    return res.status(404).json({
      status: "Error",
      message: "User not found",
    });
  }

  const product = await prisma.product.findUnique({
    where: {
      id: parseInt(productId),
    },
  });

  if (!product) {
    return res.status(404).json({
      status: "Error",
      message: "Product not found",
    });
  }

  let updatedProduct;

  if (product.isFavourite) {
    await prisma.userFavorite.deleteMany({
      where: {
        productId: parseInt(productId),
        firebaseId: firebaseId,
      },
    });
    updatedProduct = await prisma.product.update({
      where: {
        id: parseInt(productId),
      },
      data: {
        isFavourite: false,
      },
    });
  } else {
    await prisma.userFavorite.create({
      data: {
        user: {
          connect: {
            firebaseId: firebaseId,
          },
        },
        product: {
          connect: {
            id: parseInt(productId),
          },
        },
      },
    });
    updatedProduct = await prisma.product.update({
      where: {
        id: parseInt(productId),
      },
      data: {
        isFavourite: true,
      },
    });
  }

  res.status(200).json({
    status: "Success",
    isFavourite: updatedProduct.isFavourite,
  });
});

exports.getAllFavoriteProducts = asyncHandler(async (req, res, next) => {
  const firebaseId = req.params.firebaseId;

  const favoriteProducts = await prisma.userFavorite.findMany({
    where: { firebaseId: firebaseId },
    select: {
      product: true,
    },
  });

  if (!favoriteProducts || favoriteProducts.length === 0) {
    return next(new AppError("User has no favorite products", 404));
  }
    const products = favoriteProducts.map((item) => item.product);


  res.status(200).json({
    status: httpStatusText.Success,
    favoriteProducts: products
  });
});
