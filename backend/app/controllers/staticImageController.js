const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../images");
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter,
});

class StaticImageController {
  // Get multer middleware for single upload
  static getUploadMiddleware() {
    return upload.single("image");
  }

  // Get multer middleware for multiple uploads
  static getUploadMultipleMiddleware() {
    return upload.array("images", 10);
  }

  // Upload single image
  static uploadSingle(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file uploaded" });
      }

      const imageUrl = `/static/images/${req.file.filename}`;

      res.status(200).json({
        message: "Image uploaded successfully",
        filename: req.file.filename,
        originalName: req.file.originalname,
        url: imageUrl,
        size: req.file.size,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to upload image" });
    }
  }

  // Upload multiple images
  static uploadMultiple(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "No image files uploaded" });
      }

      const uploadedFiles = req.files.map((file) => ({
        filename: file.filename,
        originalName: file.originalname,
        url: `/static/images/${file.filename}`,
        size: file.size,
      }));

      res.status(200).json({
        message: "Images uploaded successfully",
        files: uploadedFiles,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to upload images" });
    }
  }

  // Get list of all static images
  static listImages(req, res) {
    try {
      const imagesPath = path.join(__dirname, "../images");

      if (!fs.existsSync(imagesPath)) {
        return res.status(200).json({ images: [] });
      }

      const files = fs.readdirSync(imagesPath);
      const imageFiles = files.filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext);
      });

      const images = imageFiles.map((file) => {
        const filePath = path.join(imagesPath, file);
        const stats = fs.statSync(filePath);

        return {
          filename: file,
          url: `/static/images/${file}`,
          size: stats.size,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime,
        };
      });

      res.status(200).json({ images });
    } catch (error) {
      console.error("List images error:", error);
      res.status(500).json({ error: "Failed to list images" });
    }
  }

  // Delete static image
  static deleteImage(req, res) {
    try {
      const { filename } = req.params;
      const filePath = path.join(__dirname, "../images", filename);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "Image not found" });
      }

      fs.unlinkSync(filePath);
      res.status(200).json({
        message: "Image deleted successfully",
        filename: filename,
      });
    } catch (error) {
      console.error("Delete error:", error);
      res.status(500).json({ error: "Failed to delete image" });
    }
  }

  // Get image info
  static getImageInfo(req, res) {
    try {
      const { filename } = req.params;
      const filePath = path.join(__dirname, "../images", filename);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "Image not found" });
      }

      const stats = fs.statSync(filePath);
      const ext = path.extname(filename).toLowerCase();

      res.status(200).json({
        filename: filename,
        url: `/static/images/${filename}`,
        size: stats.size,
        extension: ext,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
      });
    } catch (error) {
      console.error("Get image info error:", error);
      res.status(500).json({ error: "Failed to get image info" });
    }
  }
}

module.exports = StaticImageController;
