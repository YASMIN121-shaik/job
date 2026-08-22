const multer = require("multer");
const path = require("path");
const fs = require("fs");

// =====================================================
// UPLOAD DIRECTORIES
// =====================================================

const uploadRoot = path.join(
  __dirname,
  "../../uploads"
);

const resumeDirectory = path.join(
  uploadRoot,
  "resumes"
);

const jobDescriptionDirectory = path.join(
  uploadRoot,
  "job-descriptions"
);

// Create folders if they don't exist
if (!fs.existsSync(uploadRoot)) {
  fs.mkdirSync(uploadRoot, {
    recursive: true,
  });
}

if (!fs.existsSync(resumeDirectory)) {
  fs.mkdirSync(resumeDirectory, {
    recursive: true,
  });
}

if (!fs.existsSync(jobDescriptionDirectory)) {
  fs.mkdirSync(jobDescriptionDirectory, {
    recursive: true,
  });
}

// =====================================================
// FILE STORAGE
// =====================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Resume upload
    if (file.fieldname === "resume") {
      cb(null, resumeDirectory);
      return;
    }

    // Job description upload
    if (
      file.fieldname === "job_description" ||
      file.fieldname === "jobDescription" ||
      file.fieldname === "description_file"
    ) {
      cb(null, jobDescriptionDirectory);
      return;
    }

    // Default upload directory
    cb(null, uploadRoot);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(
      file.originalname
    );

    const baseName = path
      .basename(
        file.originalname,
        extension
      )
      .replace(/[^a-zA-Z0-9-_]/g, "_");

    const uniqueName =
      `${Date.now()}-${Math.round(
        Math.random() * 1000000000
      )}-${baseName}${extension}`;

    cb(null, uniqueName);
  },
});

// =====================================================
// ALLOWED FILE TYPES
// =====================================================

const allowedExtensions = [
  ".pdf",
  ".doc",
  ".docx",
  ".txt",
];

const allowedMimeTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

// =====================================================
// FILE FILTER
// =====================================================

const fileFilter = (req, file, cb) => {
  const extension = path
    .extname(file.originalname)
    .toLowerCase();

  const mimeType = file.mimetype;

  if (
    allowedExtensions.includes(extension) &&
    allowedMimeTypes.includes(mimeType)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only PDF, DOC, DOCX, and TXT files are allowed."
      ),
      false
    );
  }
};

// =====================================================
// MULTER CONFIGURATION
// =====================================================

const upload = multer({
  storage,
  fileFilter,

  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

// =====================================================
// EXPORT
// =====================================================

module.exports = upload;