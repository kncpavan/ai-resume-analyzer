const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const Resume = require('../models/resume');
const { protect } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter
});

// @route   POST /api/resumes
// @desc    Upload a resume
// @access  Private
router.post('/',
  protect,
  upload.single('resume'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Please upload a resume file'
        });
      }

      const { companyName, jobTitle, jobDescription } = req.body;

      const resume = await Resume.create({
        userId: req.user._id,
        filename: req.file.filename,
        originalName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        companyName: companyName || '',
        jobTitle: jobTitle || '',
        jobDescription: jobDescription || ''
      });

      res.status(201).json({
        success: true,
        data: resume
      });
    } catch (error) {
      console.error('Upload resume error:', error);
      res.status(500).json({
        success: false,
        message: 'Error uploading resume'
      });
    }
  }
);

// @route   GET /api/resumes
// @desc    Get all resumes for current user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: resumes.length,
      data: resumes
    });
  } catch (error) {
    console.error('Get resumes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching resumes'
    });
  }
});

// @route   GET /api/resumes/:id
// @desc    Get single resume
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    res.status(200).json({
      success: true,
      data: resume
    });
  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching resume'
    });
  }
});

// @route   PUT /api/resumes/:id
// @desc    Update resume
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    let resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    const { companyName, jobTitle, jobDescription, feedback, analysis, score } = req.body;

    resume = await Resume.findByIdAndUpdate(
      req.params.id,
      {
        companyName: companyName !== undefined ? companyName : resume.companyName,
        jobTitle: jobTitle !== undefined ? jobTitle : resume.jobTitle,
        jobDescription: jobDescription !== undefined ? jobDescription : resume.jobDescription,
        feedback: feedback !== undefined ? feedback : resume.feedback,
        analysis: analysis !== undefined ? analysis : resume.analysis,
        score: score !== undefined ? score : resume.score
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: resume
    });
  } catch (error) {
    console.error('Update resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating resume'
    });
  }
});

// @route   DELETE /api/resumes/:id
// @desc    Delete resume
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Delete file from filesystem
    if (fs.existsSync(resume.filePath)) {
      fs.unlinkSync(resume.filePath);
    }

    await resume.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting resume'
    });
  }
});

// @route   DELETE /api/resumes
// @desc    Delete all resumes for current user
// @access  Private
router.delete('/', protect, async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id });

    // Delete all files from filesystem
    for (const resume of resumes) {
      if (fs.existsSync(resume.filePath)) {
        fs.unlinkSync(resume.filePath);
      }
    }

    await Resume.deleteMany({ userId: req.user._id });

    res.status(200).json({
      success: true,
      message: 'All resumes deleted successfully'
    });
  } catch (error) {
    console.error('Delete all resumes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting resumes'
    });
  }
});

module.exports = router;
