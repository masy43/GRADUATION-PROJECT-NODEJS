const httpStatus = require("../utils/httpStatusText");
const AppError = require("../utils/AppError");
const { PrismaClient } = require("@prisma/client");
const asyncHandler = require("express-async-handler");
const validatorMiddleware = require("../middleware/validatorMiddleware");
const prisma = new PrismaClient();

exports.getAllProducts = asyncHandler(async (req, res) => {

  const products = await prisma.product.findMany();
  res.status(200).json({ status: httpStatus.Success, data: products });
});

exports.getProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const productId = parseInt(id);

  const product = await prisma.product.findUnique({ where: { id: productId } });

  if (!product) {
    return next(new AppError("Product not found", 404));
  }
  res.status(200).json({ status: httpStatus.Success, data: product });
});

exports.createProduct = asyncHandler(async (req, res, next) => {
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
    return next(new AppError("Missing category ID", 400));
  }

  const existingCategory = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!existingCategory) {
    return next(new AppError("Invalid category ID", 400));
  }

  const productData = {
    name,
    price,
    brand,
    category: { connect: { id: categoryId } },
    product_image_url,
    description,
    skin_type,
    stock_quantity,
  };

  const product = await prisma.product.create({
    data: productData,
  });

  res.status(201).json({ status: "Success", data: product });
});

exports.updateProduct = asyncHandler(async (req, res, next) => {
  validatorMiddleware(req, res, async (err) => {
    if (err) {
      return next(err);
    }

    const productId = parseInt(req.params.id);
    const updatedProductData = req.body;

    const product = await prisma.product.update({
      where: { id: productId },
      data: updatedProductData,
    });

    if (!product) {
      return next(new AppError(404, "Product not found"));
    }

    res.status(200).json({ status: httpStatus.Success, data: product });
  });
});

exports.deleteProduct = asyncHandler(async (req, res, next) => {

  const productToDelete = await prisma.product.findUnique({
    where: { id: parseInt(req.params.id) },
  });

  if (!productToDelete) {
    return next(new AppError("Product not found", 404));
  }

  await prisma.product.delete({
    where: { id: parseInt(req.params.id) },
  });

  res.status(200).json({
    status: "Success",
    message: "Product deleted successfully",
  });
});

exports.searchProducts = asyncHandler(async (req, res, next) => {
  const { searchQuery } = req.params;

  if (!searchQuery) {
    return next(new AppError("Search query is required", 400));
  }

  const products = await prisma.product.findMany({
    where: {
      OR: [{ name: { contains: searchQuery, mode: "insensitive" } }],
    },
  });

  res.json({ status: httpStatus.Success, data: { products } });
});

