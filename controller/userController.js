const { PrismaClient } = require("@prisma/client");
const AppError = require("../utils/AppError");
const httpStatus = require("../utils/httpStatusText");
const validatorMiddleware = require("../middleware/validatorMiddleware");
const asyncHandler = require("express-async-handler");

const prisma = new PrismaClient();

exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await prisma.user.findMany({
    select: {
      firebaseId: true,
    },
  });

  res.status(200).json({ status: httpStatus.Success, data: users });
});

exports.register = asyncHandler(async (req, res, next) => {
  validatorMiddleware(req, res, async (err) => {
    if (err) {
      return next(err);
    }
  });

  const { firebaseId } = req.body;

  const oldUser = await prisma.user.findUnique({
    where: { firebaseId: firebaseId },
  });

  if (oldUser) {
    return next(new AppError("User already exists", 400));
  }

  const newUser = await prisma.user.create({
    data: {
      firebaseId: firebaseId,
    },
  });

  return res.status(200).json({
    status: "Success",
    data: {
      firebaseId: firebaseId,
    },
  });
});

exports.login = asyncHandler(async (req, res, next) => {
  const { firebaseId } = req.body;

  if (!firebaseId) {
    return next(new AppError("User not found", 404));
  }

  const user = await prisma.user.findUnique({
    where: { firebaseId: firebaseId },
  });

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  return res.status(200).json({
    status: httpStatus.Success,
    message: "This user logins successfully",
  });
});

exports.updateAddress = asyncHandler(async (req, res, next) => {
  const { firebaseId, address } = req.body;

  const user = await prisma.user.findUnique({
    where: { firebaseId: firebaseId },
  });

  if (!user) {
    return res.status(404).json({
      status: "Error",
      message: "User not found",
    });
  }

  if (address) {
    const existingAddress = await prisma.address.findFirst({
      where: {
        address: address,
        firebaseId: user.firebaseId,
      },
    });

    if (existingAddress) {
      return res.status(400).json({
        status: "Error",
        message: "Address already exists for the user",
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        address: address,
        firebaseId: firebaseId,
      },
    });

    return res.status(200).json({
      status: "Success",
      message: "Address added successfully",
      address: newAddress,
    });
  }
});

exports.updatePhoneNumber = asyncHandler(async (req, res, next) => {
  const { firebaseId, phoneNumber } = req.body;

  const user = await prisma.user.findUnique({
    where: { firebaseId: firebaseId },
  });

  if (!user) {
    return res.status(404).json({
      status: "Error",
      message: "User not found",
    });
  }

  if (phoneNumber) {
    const existingPhone = user.phoneNumber;
    if (existingPhone && existingPhone === phoneNumber) {
      return res.status(400).json({
        status: "Error",
        message: "Phone number already exists for the user",
      });
    }

    const updatedUser = await prisma.user.update({
      where: { firebaseId: firebaseId },
      data: {
        phoneNumber: phoneNumber,
      },
    });

    return res.status(200).json({
      status: "Success",
      message: "Phone number updated successfully",
      user: updatedUser,
    });
  }
});

exports.getUserById = asyncHandler(async (req, res, next) => {
  const firebaseId = req.params.firebaseId;

  const user = await prisma.user.findUnique({
    where: {
      firebaseId: firebaseId,
    },
    include: {
      addresses: true,
    },
  });

  if (!user) {
    return res.status(404).json({
      status: "Error",
      message: "User not found",
    });
  }

  const phoneNumber = await prisma.user.findUnique({
    where: {
      firebaseId: firebaseId,
    },
    select: {
      phoneNumber: true,
    },
  });

  user.phoneNumber = phoneNumber.phoneNumber;

  const formattedAddresses = user.addresses.map(address => ({
    address: address.address
  }));

  const response = {
    status: "Success",
    user: {
      firebaseId: user.firebaseId,
      phoneNumber: user.phoneNumber,
      role: user.role,
      avatar: user.avatar,
      addresses: formattedAddresses,
    }
  };

  res.status(200).json(response);
});