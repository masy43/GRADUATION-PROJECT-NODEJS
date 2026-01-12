import type { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";

import AppError from "../utils/AppError";
import httpStatusText from "../utils/httpStatusText";
import prisma from "../utils/prismaClient";

type RequestWithFile = Request & { file?: Express.Multer.File };

export const getAllUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    select: {
      firebaseId: true,
    },
  });

  res.status(200).json({ status: httpStatusText.Success, data: users });
});

export const register = asyncHandler(
  async (req: RequestWithFile, res: Response, next: NextFunction) => {
    const { firebaseId } = req.body;

    if (!firebaseId) {
      next(new AppError("firebaseId is required", 400));
      return;
    }

    const oldUser = await prisma.user.findUnique({ where: { firebaseId } });
    if (oldUser) {
      next(new AppError("User already exists", 400));
      return;
    }

    const avatar = req.file ? `/uploads/${req.file.filename}` : undefined;

    const newUser = await prisma.user.create({
      data: {
        firebaseId,
        ...(avatar ? { avatar } : {}),
      },
    });

    res.status(200).json({
      status: httpStatusText.Success,
      data: {
        firebaseId,
        avatar: newUser.avatar,
      },
    });
  }
);

export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { firebaseId } = req.body;

  if (!firebaseId) {
    next(new AppError("firebaseId is required", 400));
    return;
  }

  const user = await prisma.user.findUnique({ where: { firebaseId } });
  if (!user) {
    next(new AppError("User not found", 404));
    return;
  }

  res.status(200).json({
    status: httpStatusText.Success,
    message: "User logged in successfully",
  });
});

export const updateAddress = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { firebaseId, address } = req.body;

    if (!firebaseId) {
      next(new AppError("firebaseId is required", 400));
      return;
    }

    if (!address) {
      next(new AppError("address is required", 400));
      return;
    }

    const user = await prisma.user.findUnique({ where: { firebaseId } });
    if (!user) {
      next(new AppError("User not found", 404));
      return;
    }

    const existingAddress = await prisma.address.findFirst({
      where: {
        address,
        firebaseId: user.firebaseId,
      },
    });

    if (existingAddress) {
      next(new AppError("Address already exists for the user", 400));
      return;
    }

    const newAddress = await prisma.address.create({
      data: {
        address,
        firebaseId,
      },
    });

    res.status(200).json({
      status: httpStatusText.Success,
      message: "Address added successfully",
      address: newAddress,
    });
  }
);

export const updatePhoneNumber = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { firebaseId, phoneNumber } = req.body;

    if (!firebaseId) {
      next(new AppError("firebaseId is required", 400));
      return;
    }

    if (!phoneNumber) {
      next(new AppError("phoneNumber is required", 400));
      return;
    }

    const user = await prisma.user.findUnique({ where: { firebaseId } });
    if (!user) {
      next(new AppError("User not found", 404));
      return;
    }

    if (user.phoneNumber && user.phoneNumber === phoneNumber) {
      next(new AppError("Phone number already exists for the user", 400));
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { firebaseId },
      data: { phoneNumber },
    });

    res.status(200).json({
      status: httpStatusText.Success,
      message: "Phone number updated successfully",
      user: updatedUser,
    });
  }
);

export const getUserById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { firebaseId } = req.params;

  const user = await prisma.user.findUnique({
    where: { firebaseId },
    include: { addresses: true },
  });

  if (!user) {
    next(new AppError("User not found", 404));
    return;
  }

  const formattedAddresses = user.addresses.map((address) => ({ address: address.address }));

  res.status(200).json({
    status: httpStatusText.Success,
    user: {
      firebaseId: user.firebaseId,
      phoneNumber: user.phoneNumber,
      role: user.role,
      avatar: user.avatar,
      addresses: formattedAddresses,
    },
  });
});
