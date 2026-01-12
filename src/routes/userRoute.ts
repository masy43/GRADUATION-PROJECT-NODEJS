import express from "express";
import multer from "multer";

import * as userController from "../controller/userController";
import AppError from "../utils/AppError";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, "uploads/");
  },
  filename: function (_req, file, cb) {
    const extension = file.mimetype.split("/")[1];
    const filename = `user-${Date.now()}.${extension}`;
    cb(null, filename);
  },
});

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  const imageType = file.mimetype.split("/")[0];
  if (imageType === "image") {
    cb(null, true);
  } else {
    cb(new AppError("ONLY IMAGES SUPPORTED!", 400));
  }
};

const upload = multer({
  storage,
  fileFilter,
});

router.get("/", userController.getAllUsers);
router.post("/login", userController.login);
router.post("/register", upload.single("avatar"), userController.register);
router.put("/address", userController.updateAddress);
router.put("/phoneNumber", userController.updatePhoneNumber);
router.get("/:firebaseId", userController.getUserById);

export default router;
