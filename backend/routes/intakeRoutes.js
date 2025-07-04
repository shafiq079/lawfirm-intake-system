
const express = require('express');
const { createIntake, getIntakes, getIntakeByLink, submitIntakeForm } = require('../controllers/intakeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').post(protect, createIntake).get(protect, getIntakes);
router.route('/:intakeLink').get(getIntakeByLink);
router.route('/submit').post(submitIntakeForm);

module.exports = router;
