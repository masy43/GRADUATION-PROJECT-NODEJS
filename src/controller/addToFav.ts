import type { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";

import AppError from "../utils/AppError";
import httpStatusText from "../utils/httpStatusText";
import prisma from "../utils/prismaClient";

export const toggleFavoriteStatus = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { firebaseId, productId } = req.body;

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

    if (product.isFavourite) {
      await prisma.userFavorite.deleteMany({ where: { firebaseId, productId: productIdInt } });

      const updatedProduct = await prisma.product.update({
        where: { id: productIdInt },
        data: { isFavourite: false },
      });

      res.status(200).json({
        status: httpStatusText.Success,
        isFavourite: updatedProduct.isFavourite,
      });
      return;
    }

    await prisma.userFavorite.create({
      data: { firebaseId, productId: productIdInt },
    });

    const updatedProduct = await prisma.product.update({
      where: { id: productIdInt },
      data: { isFavourite: true },
    });

    res.status(200).json({
      status: httpStatusText.Success,
      isFavourite: updatedProduct.isFavourite,
    });
  }
);

export const getAllFavoriteProducts = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { firebaseId } = req.params;

    if (!firebaseId) {
      next(new AppError("firebaseId is required", 400));
      return;
    }

    const favoriteProducts = await prisma.userFavorite.findMany({
      where: { firebaseId },
      select: { product: true },
    });

    if (!favoriteProducts || favoriteProducts.length === 0) {
      next(new AppError("User has no favorite products", 404));
      return;
    }

    const products = favoriteProducts.map((item) => item.product);

    res.status(200).json({
      status: httpStatusText.Success,
      favoriteProducts: products,
    });
  }
);
