
const mongoose = require('mongoose');

const intakeSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    intakeType: {
      type: String,
      required: true,
    },
    intakeLink: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      required: true,
      default: 'Not Started',
    },
    formData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    riskAlerts: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const Intake = mongoose.model('Intake', intakeSchema);

module.exports = Intake;
