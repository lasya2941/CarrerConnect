const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const Application = require("../models/Application");
const { auth, requireHR } = require("../middleware/auth");

const router = express.Router();

const uploadDir = path.join(__dirname, "..", "uploads");

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const safeName = path
      .basename(file.originalname)
      .replace(/[^a-zA-Z0-9._-]/g, "_");

    cb(null, Date.now() + "-" + safeName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    if (allowed.includes(file.mimetype)) {
      return cb(null, true);
    }

    cb(new Error("Upload a PDF or Word resume only"));
  }
});

// Submit a job application
router.post("/", auth, upload.single("resume"), async (req, res) => {
  try {
    if (req.user.role !== "student") {
      if (req.file) fs.unlink(req.file.path, () => {});

      return res.status(403).json({
        message: "Only students can apply for jobs"
      });
    }

    const {
      jobId,
      title,
      company,
      category,
      location,
      type,
      salary,
      fullName,
      email,
      phone,
      college,
      qualification,
      branch,
      graduationYear,
      skills,
      experience,
      interest
    } = req.body;

    const requiredFields = {
      jobId,
      title,
      company,
      fullName,
      email,
      phone,
      college,
      qualification,
      branch,
      graduationYear,
      skills,
      experience,
      interest
    };

    const missingField = Object.entries(requiredFields).find(
      ([key, value]) =>
        value === undefined || String(value).trim() === ""
    );

    if (missingField) {
      if (req.file) fs.unlink(req.file.path, () => {});

      return res.status(400).json({
        message: `Please provide ${missingField[0]}`
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (req.file) fs.unlink(req.file.path, () => {});

      return res.status(400).json({
        message: "Please enter a valid email address"
      });
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      if (req.file) fs.unlink(req.file.path, () => {});

      return res.status(400).json({
        message: "Phone number must contain exactly 10 digits"
      });
    }

    const year = Number(graduationYear);

    if (
      !Number.isInteger(year) ||
      year < 2000 ||
      year > 2100
    ) {
      if (req.file) fs.unlink(req.file.path, () => {});

      return res.status(400).json({
        message: "Please enter a valid graduation year"
      });
    }

    const application = await Application.create({
      applicant: req.user.id,
      jobId: Number(jobId),
      title,
      company,
      category,
      location,
      type,
      salary,

      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      college: college.trim(),
      qualification,
      branch,
      graduationYear: year,
      skills: skills.trim(),
      experience,
      interest: interest.trim(),

      resumePath: req.file ? req.file.filename : ""
    });

    return res.status(201).json({
      message: "Application submitted successfully",
      application
    });
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }

    if (error.code === 11000) {
      return res.status(409).json({
        message: "You have already applied for this job"
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Please check all required application details"
      });
    }

    console.error("Application submission error:", error);

    return res.status(500).json({
      message: "Could not submit application"
    });
  }
});

// Get applications belonging to the logged-in student
router.get("/my", auth, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        message: "Student access only"
      });
    }

    const applications = await Application.find({
      applicant: req.user.id
    }).sort({ createdAt: -1 });

    return res.json(applications);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Could not load applications"
    });
  }
});

// HR can view all applications and student details
router.get("/all", auth, requireHR, async (req, res) => {
  try {
    const applications = await Application.find()
      .populate("applicant", "name email")
      .sort({ createdAt: -1 });

    return res.json(applications);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Could not load applications"
    });
  }
});

// HR updates application status
router.patch("/:id/status", auth, requireHR, async (req, res) => {
  try {
    const allowed = [
      "Under Review",
      "Accepted",
      "Rejected"
    ];

    const { status } = req.body;

    if (!allowed.includes(status)) {
      return res.status(400).json({
        message: "Invalid application status"
      });
    }

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true
      }
    );

    if (!application) {
      return res.status(404).json({
        message: "Application not found"
      });
    }

    return res.json({
      message: "Application status updated",
      application
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Could not update application status"
    });
  }
});

// HR can download a submitted resume
router.get("/resume/:filename", auth, requireHR, async (req, res) => {
  try {
    const filename = path.basename(req.params.filename);

    const application = await Application.findOne({
      resumePath: filename
    });

    if (!application) {
      return res.status(404).json({
        message: "Resume not found"
      });
    }

    const filePath = path.join(uploadDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        message: "Resume file not found on server"
      });
    }

    return res.download(filePath);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Could not download resume"
    });
  }
});

module.exports = router;