
const mongoose = require('mongoose');

const intakeSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    // Personal Information
    fullName: { type: String, default: '' },
    dateOfBirth: { type: String, default: '' },
    placeOfBirth: { type: String, default: '' },
    gender: { type: String, default: '' },
    nationality: { type: String, default: '' },
    currentAddress: { type: String, default: '' },
    email: { type: String, default: '' },
    phoneNumber: { type: String, default: '' },

    // Passport & Travel History
    passportNumber: { type: String, default: '' },
    passportIssuingCountry: { type: String, default: '' },
    passportIssueDate: { type: String, default: '' },
    passportExpiryDate: { type: String, default: '' },
    hasPreviousTravel: { type: Boolean, default: false },
    previousTravelDetails: { type: String, default: '' },

    // Immigration Intent
    immigrationGoal: { type: String, default: '' },
    visaType: { type: String, default: '' },
    hasSponsor: { type: Boolean, default: false },
    sponsorDetails: { type: String, default: '' },

    // Family Information
    maritalStatus: { type: String, default: '' },
    spouseName: { type: String, default: '' },
    hasChildren: { type: Boolean, default: false },
    childrenDetails: { type: String, default: '' },

    // Employment & Education
    highestEducation: { type: String, default: '' },
    educationDetails: { type: String, default: '' },
    occupation: { type: String, default: '' },
    employmentHistory: { type: String, default: '' },

    // Legal & Background
    hasCriminalRecord: { type: Boolean, default: false },
    criminalRecordDetails: { type: String, default: '' },
    hasPreviousImmigrationApps: { type: Boolean, default: false },
    previousImmigrationAppDetails: { type: String, default: '' },

    // Documents Uploaded
    uploadedDocuments: [
      {
        documentType: { type: String, required: true },
        cloudinaryUrl: { type: String, required: true },
      },
    ],

    // Meta
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
      default: 'In Progress',
    },
    riskAlerts: {
      type: [String],
      default: [],
    },
    clioSyncStatus: {
      type: String,
      enum: ['Not Synced', 'Synced', 'Pending', 'Failed'],
      default: 'Not Synced',
    },
    clioMatterId: {
      type: String,
    },
  },
  { timestamps: true }
);

const Intake = mongoose.model('Intake', intakeSchema);

module.exports = Intake;
