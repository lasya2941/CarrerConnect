const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    jobId: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    company: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      default: ""
    },
    location: {
      type: String,
      default: ""
    },
    type: {
      type: String,
      default: ""
    },
    salary: {
      type: String,
      default: ""
    },
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    college: {
      type: String,
      required: true,
      trim: true
    },
    qualification: {
      type: String,
      required: true,
      trim: true
    },
    branch: {
      type: String,
      required: true,
      trim: true
    },
    graduationYear: {
      type: Number,
      required: true
    },
    skills: {
      type: String,
      required: true
    },
    experience: {
      type: String,
      required: true
    },
    interest: {
      type: String,
      required: true,
      trim: true
    },
    resumePath: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["Under Review", "Accepted", "Rejected"],
      default: "Under Review"
    }
  },
  { timestamps: true }
);

applicationSchema.index({ applicant: 1, jobId: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);
