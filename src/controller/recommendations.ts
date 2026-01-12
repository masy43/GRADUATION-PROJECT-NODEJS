import type { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";

import AppError from "../utils/AppError";
import httpStatusText from "../utils/httpStatusText";
import prisma from "../utils/prismaClient";

export const recommendProducts = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { firebaseId } = req.params;

    if (!firebaseId) {
      next(new AppError("firebaseId is required", 400));
      return;
    }

    const skinProfile = await prisma.skinProfile.findUnique({
      where: { firebaseId },
      include: { User: true, recommendations: true },
    });

    if (!skinProfile || skinProfile.firebaseId !== firebaseId) {
      next(new AppError("Skin profile not found", 404));
      return;
    }

    const skinType = skinProfile.skinType.toLowerCase();

    let recommendedProducts = [];
    switch (skinType) {
      case "oily":
      case "acne":
      case "oily s":
        recommendedProducts = await prisma.product.findMany({
          where: { skin_type: { in: ["Oily", "Acne", "Oily S"] } },
        });
        break;
      case "dry":
      case "dry s":
        recommendedProducts = await prisma.product.findMany({
          where: { skin_type: { in: ["Dry", "Dry S"] } },
        });
        break;
      case "normal":
      case "normal s":
        recommendedProducts = await prisma.product.findMany({
          where: { skin_type: { in: ["Normal", "Normal S"] } },
        });
        break;
      case "combination":
      case "combinational s":
        recommendedProducts = await prisma.product.findMany({
          where: { skin_type: { in: ["Combination", "Combinational S"] } },
        });
        break;
      default:
        next(new AppError("Invalid skin type in the profile", 400));
        return;
    }

    const responseData = {
      products: recommendedProducts.map((product) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        product_image_url: product.product_image_url,
      })),
    };

    res.status(200).json({
      status: httpStatusText.Success,
      skinType,
      data: responseData,
    });
  }
);
