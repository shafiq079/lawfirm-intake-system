
const express = require('express');
const { syncToClio, getClioAuthUrl, clioCallback, getClioStatus } = require('../controllers/clioController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/sync').post(protect, syncToClio);
router.route('/auth-url').get(protect, getClioAuthUrl);
router.route('/callback').get(clioCallback);
router.route('/status').get(protect, getClioStatus);

module.exports = router;
