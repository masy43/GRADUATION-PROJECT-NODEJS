const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const extention = file.mimetype.split('/')[1];
    const filename = `user-${Date.now()}.${extention}`;
    cb(null, filename);
  },
});
const fileFilter = (req, file, cb) => {
  const imageType = file.mimetype.split('/')[0];
  if (imageType == 'image' ) {
    cb(null, true);
  } else {
    cb(new Error('ONLY IMAGES SUPPORTED!',400), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter
});

router.get("/",
  userController.getAllUsers);

router.post("/login",
  userController.login);

router.post("/register",
  upload.single('avatar'),
  userController.register);

router.put("/address", userController.updateAddress);

router.put("/phoneNumber", userController.updatePhoneNumber);

router.get("/:firebaseId", userController.getUserById);



module.exports = router;
