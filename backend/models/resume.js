const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  companyName: {
    type: String,
    default: ''
  },
  jobTitle: {
    type: String,
    default: ''
  },
  jobDescription: {
    type: String,
    default: ''
  },
  feedback: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  analysis: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  score: {
    type: Number,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Resume', resumeSchema);
