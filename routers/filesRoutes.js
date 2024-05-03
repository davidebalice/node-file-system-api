const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const fileController = require('../controllers/fileController');
const bodyParser = require('body-parser');
const urlencodeParser = bodyParser.urlencoded({ extended: false });

router.route('/files').get(authController.protect, fileController.getFiles);
router.route('/file').get(authController.protect, fileController.getFile);
router.route('/checkdir').get(authController.protect, fileController.checkDirectory);

module.exports = router;
