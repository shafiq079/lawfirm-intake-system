
const express = require('express');
const multer = require('multer'); // Import multer explicitly
const { upload, processImage, uploadRequiredDocument } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Define a dedicated middleware for single document upload with error handling
const uploadSingleDocumentMiddleware = (req, res, next) => {
  upload.single('document')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      console.error('Multer error:', err);
      return res.status(400).json({ message: err.message });
    } else if (err) {
      // An unknown error occurred when uploading.
      console.error('Unknown upload error:', err);
      return res.status(500).json({ message: 'An unknown error occurred during file upload.' });
    }
    next(); // Continue to the next middleware/route handler
  });
};

router.route('/').post(protect, upload.single('image'), processImage);

router.post('/required-document', uploadSingleDocumentMiddleware, async (req, res, next) => {
  try {
    await uploadRequiredDocument(req, res, next);
  } catch (error) {
    console.error('Error in uploadRequiredDocument route handler:', error);
    res.status(error.statusCode || 500).json({ message: error.message || 'Server Error' });
  }
}); // Use the new middleware

module.exports = router;
