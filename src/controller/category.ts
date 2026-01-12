import type { Request, Response } from "express";
import asyncHandler from "express-async-handler";

import AppError from "../utils/AppError";
import httpStatusText from "../utils/httpStatusText";
import prisma from "../utils/prismaClient";

export const getAllCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await prisma.category.findMany();
  res.json({ status: httpStatusText.Success, data: categories });
});

export const getCategoryById = asyncHandler(async (req: Request, res: Response) => {
  const categoryId = parseInt(req.params.id, 10);
  const category = await prisma.category.findUnique({ where: { id: categoryId } });

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  const products = await prisma.product.findMany({ where: { categoryId } });

  const categoryWithProducts = { ...category, products };

  res.json({ status: httpStatusText.Success, data: categoryWithProducts });
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const { name, image_url } = req.body;

  const category = await prisma.category.create({
    data: {
      name,
      category_image_url: image_url,
    },
  });

  res.status(201).json({ status: httpStatusText.Success, data: category });
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const categoryId = parseInt(req.params.id, 10);
  const { name } = req.body;

  const updatedCategory = await prisma.category.update({
    where: { id: categoryId },
    data: { name },
  });

  if (!updatedCategory) {
    throw new AppError("Category not found", 404);
  }

  res.json({ status: httpStatusText.Success, data: updatedCategory });
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const categoryId = parseInt(req.params.id, 10);

  const deletedCategory = await prisma.category.delete({ where: { id: categoryId } });

  if (!deletedCategory) {
    throw new AppError("Category not found", 404);
  }

  res.json({
    status: httpStatusText.Success,
    message: "Category deleted successfully",
  });
});

export const addProductToCategory = asyncHandler(async (req: Request, res: Response) => {
  const { categoryId, productId } = req.body;

  const categoryIdInt = parseInt(String(categoryId), 10);
  const productIdInt = parseInt(String(productId), 10);

  const category = await prisma.category.findUnique({ where: { id: categoryIdInt } });
  if (!category) {
    throw new AppError("Category not found", 404);
  }

  const product = await prisma.product.findUnique({ where: { id: productIdInt } });
  if (!product) {
    throw new AppError("Product not found", 404);
  }

  await prisma.category.update({
    where: { id: categoryIdInt },
    data: {
      products: {
        connect: { id: productIdInt },
      },
    },
  });

  res.json({
    status: httpStatusText.Success,
    message: "Product added to category successfully",
  });
});

export const getProductsByCategory = asyncHandler(async (req: Request, res: Response) => {
  const categoryId = parseInt(req.params.id, 10);

  const products = await prisma.product.findMany({ where: { categoryId } });

  res.status(200).json({ status: httpStatusText.Success, data: products });
});
