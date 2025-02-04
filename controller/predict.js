const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const asyncHandler = require("express-async-handler");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

exports.sendPost = asyncHandler(async (req, res) => {
  const url = "http://134.209.243.60:6666/predict";

  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const formData = new FormData();
  formData.append("file", file.buffer, { filename: file.originalname });

  try {
    const response = await axios.post(url, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    const { prediction, probability } = response.data;

    const { firebaseId } = req.params;

    const existingProfile = await prisma.skinProfile.findUnique({
      where: { firebaseId: firebaseId },
    });

    if (existingProfile) {
      await prisma.skinProfile.update({
        where: { firebaseId: firebaseId },
        data: { skinType: prediction },
      });
    } else {
      await prisma.skinProfile.create({
        data: {
          skinType: prediction,
          firebaseId: firebaseId,
        },
      });
    }

    res.json({ prediction, probability });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ prediction: "Unknown", probability: 0 });
  }
});
