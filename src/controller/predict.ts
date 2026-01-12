import type { Request, Response } from "express";
import axios from "axios";
import asyncHandler from "express-async-handler";
import FormData from "form-data";

import prisma from "../utils/prismaClient";

type RequestWithFile = Request & { file?: Express.Multer.File };

export const sendPost = asyncHandler(async (req: RequestWithFile, res: Response) => {
  const url = "http://134.209.243.60:6666/predict";

  const file = req.file;
  if (!file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  const formData = new FormData();
  // multer memoryStorage provides buffer
  formData.append("file", file.buffer, { filename: file.originalname });

  try {
    const response = await axios.post(url, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    const { prediction, probability } = response.data as {
      prediction: string;
      probability: number;
    };

    const { firebaseId } = req.params;

    const existingProfile = await prisma.skinProfile.findUnique({ where: { firebaseId } });

    if (existingProfile) {
      await prisma.skinProfile.update({
        where: { firebaseId },
        data: { skinType: prediction },
      });
    } else {
      await prisma.skinProfile.create({
        data: { skinType: prediction, firebaseId },
      });
    }

    res.json({ prediction, probability });
    return;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error:", error);
    res.status(500).json({ prediction: "Unknown", probability: 0 });
    return;
  }
});
