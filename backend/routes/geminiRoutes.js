const express = require('express');
const { processGeminiRequest } = require('../controllers/geminiController');

const router = express.Router();

router.post('/process-form', processGeminiRequest);

module.exports = router;