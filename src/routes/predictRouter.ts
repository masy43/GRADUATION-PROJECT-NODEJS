import express from "express";
import multer from "multer";

import * as predictController from "../controller/predict";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/predict/:firebaseId", upload.single("file"), predictController.sendPost);

export default router;
