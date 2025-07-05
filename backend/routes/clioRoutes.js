
const express = require('express');
const { syncToClio, getClioAuthUrl, clioCallback, getClioStatus, uploadDocumentToClio } = require('../controllers/clioController');
const multer = require('multer');
const upload = multer();
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/sync').post(protect, syncToClio);
router.route('/auth-url').get(protect, getClioAuthUrl);
router.route('/callback').get(clioCallback);
router.route('/status').get(protect, getClioStatus);
router.route('/upload-document').post(protect, upload.single('document'), uploadDocumentToClio);

module.exports = router;
