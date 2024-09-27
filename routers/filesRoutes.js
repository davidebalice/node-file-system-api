const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const fileController = require("../controllers/fileController");
const bodyParser = require("body-parser");
const urlencodeParser = bodyParser.urlencoded({ extended: false });
const demoMode = require("../middlewares/demo_mode");

router.route("/files").get(authController.protect, fileController.getFiles);
router.route("/file").get(authController.protect, fileController.getFile);
router
  .route("/photo/:filename")
  .get(authController.protect, fileController.getPhoto);
router
  .route("/new")
  .post(demoMode, authController.protect, fileController.newFile);
router
  .route("/edit")
  .post(demoMode, authController.protect, fileController.saveFile);
router
  .route("/delete")
  .post(demoMode, authController.protect, fileController.deleteFile);
router
  .route("/rename")
  .post(demoMode, authController.protect, fileController.renameFile);
router
  .route("/checkdir")
  .get(authController.protect, fileController.checkDirectory);

module.exports = router;
