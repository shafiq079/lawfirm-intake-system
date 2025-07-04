
const express = require('express');
const { handleGatheredSpeech, handleGatheredEmail } = require('../controllers/voiceGatherController');

const router = express.Router();

router.route('/gather').post(handleGatheredSpeech);
router.route('/gather-email').post(handleGatheredEmail);

module.exports = router;
