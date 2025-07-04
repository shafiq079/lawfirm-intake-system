
const express = require('express');
const router = express.Router();
const { handleVoiceCall, initiateVoiceCall, processVoice } = require('../controllers/voiceController');
const { upload } = require('../controllers/uploadController');

// Existing Twilio routes
router.post('/', handleVoiceCall);
router.post('/initiate', initiateVoiceCall);

// New route for processing uploaded voice memos
router.post('/process', upload.single('audio'), processVoice);

module.exports = router;
