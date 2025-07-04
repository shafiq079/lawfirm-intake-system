
const express = require('express');
const { upload, processImage } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').post(protect, upload.single('image'), processImage);

module.exports = router;
