const express = require("express");
const postController = require("../controller/predict");
const multer = require("multer");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/predict/:firebaseId",
  upload.single("file"),
  postController.sendPost
);

module.exports = router;
