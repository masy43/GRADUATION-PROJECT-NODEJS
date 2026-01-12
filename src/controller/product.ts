import type { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";

import AppError from "../utils/AppError";
import httpStatusText from "../utils/httpStatusText";
import prisma from "../utils/prismaClient";

export const getAllProducts = asyncHandler(async (_req: Request, res: Response) => {
  const products = await prisma.product.findMany();
  res.status(200).json({ status: httpStatusText.Success, data: products });
});

export const getProduct = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const productId = parseInt(req.params.id, 10);
  if (Number.isNaN(productId)) {
    next(new AppError("Invalid product id", 400));
    return;
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });

  if (!product) {
    next(new AppError("Product not found", 404));
    return;
  }

  res.status(200).json({ status: httpStatusText.Success, data: product });
});

export const createProduct = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      name,
      price,
      brand,
      categoryId,
      product_image_url,
      description,
      skin_type,
      stock_quantity,
    } = req.body;

    if (!categoryId) {
      next(new AppError("Missing category ID", 400));
      return;
    }

    const categoryIdInt = parseInt(String(categoryId), 10);
    if (Number.isNaN(categoryIdInt)) {
      next(new AppError("Invalid category ID", 400));
      return;
    }

    const existingCategory = await prisma.category.findUnique({ where: { id: categoryIdInt } });
    if (!existingCategory) {
      next(new AppError("Invalid category ID", 400));
      return;
    }

    const product = await prisma.product.create({
      data: {
        name,
        price,
        brand,
        category: { connect: { id: categoryIdInt } },
        product_image_url,
        description,
        skin_type,
        stock_quantity,
      },
    });

    res.status(201).json({ status: httpStatusText.Success, data: product });
  }
);

export const updateProduct = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const productId = parseInt(req.params.id, 10);
    if (Number.isNaN(productId)) {
      next(new AppError("Invalid product id", 400));
      return;
    }

    const existing = await prisma.product.findUnique({ where: { id: productId } });
    if (!existing) {
      next(new AppError("Product not found", 404));
      return;
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: req.body,
    });

    res.status(200).json({ status: httpStatusText.Success, data: updated });
  }
);

export const deleteProduct = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const productId = parseInt(req.params.id, 10);
    if (Number.isNaN(productId)) {
      next(new AppError("Invalid product id", 400));
      return;
    }

    const productToDelete = await prisma.product.findUnique({ where: { id: productId } });
    if (!productToDelete) {
      next(new AppError("Product not found", 404));
      return;
    }

    await prisma.product.delete({ where: { id: productId } });

    res
      .status(200)
      .json({ status: httpStatusText.Success, message: "Product deleted successfully" });
  }
);

export const searchProducts = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { searchQuery } = req.params;

    if (!searchQuery) {
      next(new AppError("Search query is required", 400));
      return;
    }

    const products = await prisma.product.findMany({
      where: {
        OR: [{ name: { contains: searchQuery, mode: "insensitive" } }],
      },
    });

    res.json({ status: httpStatusText.Success, data: { products } });
  }
);
