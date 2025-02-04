const { PrismaClient } = require("@prisma/client");
const asyncHandler = require("express-async-handler");
const httpStatusText = require("../utils/httpStatusText");
const AppError = require("../utils/AppError");

const prisma = new PrismaClient();

const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany();
  res.json({ status: httpStatusText.Success, data: categories });
});

const getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await prisma.category.findUnique({
    where: { id: parseInt(id) },
  });

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  const products = await prisma.product.findMany({
    where: {
      categoryId: parseInt(id),
    },
  });

  const categoryWithProducts = { ...category, products };

  res.json({ status: httpStatusText.Success, data: categoryWithProducts });
});

const createCategory = asyncHandler(async (req, res) => {
  const { name, image_url } = req.body;
  const category = await prisma.category.create({
    data: {
      name,
      category_image_url: image_url
    }
  });
  res.status(201).json({ status: httpStatusText.Success, data: category });
});

const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, } = req.body;
  const updatedCategory = await prisma.category.update({
    where: { id: parseInt(id) },
    data: { name },
  });

  if (!updatedCategory) {
    throw new AppError("Category not found", 404);
  }

  res.json({ status: httpStatusText.Success, data: updatedCategory });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deletedCategory = await prisma.category.delete({
    where: { id: parseInt(id) },
  });

  if (!deletedCategory) {
    throw new AppError("Category not found", 404);
  }

  res.json({
    status: httpStatusText.Success,
    message: "Category deleted successfully",
  });
});

const addProductToCategory = asyncHandler(async (req, res) => {
  const { categoryId, productId } = req.body;

  const category = await prisma.category.findUnique({
    where: { id: parseInt(categoryId) },
  });

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  const product = await prisma.product.findUnique({
    where: { id: parseInt(productId) }, 
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  await prisma.category.update({
    where: { id: parseInt(categoryId) },
    data: {
      products: {
        connect: { id: parseInt(productId) },
      },
    },
  });

  res.json({
    status: httpStatusText.Success,
    message: "Product added to category successfully",
  });
});

const getProductsByCategory = asyncHandler(async (req, res, next) => {
  const id = req.params.id;

  const products = await prisma.product.findMany({
    where: {
      categoryId: parseInt(id),
    },
  });

  res.status(200).json({ products });
});

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  addProductToCategory,
  getProductsByCategory,
};

