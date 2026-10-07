const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const config = require("../config/env");
const { badRequest, notFound, wrapController } = require("../utils/httpError");

const IMAGES_DIR = config.uploads.imagesDir;
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

/** Multer instance that stores validated images in IMAGES_DIR/<subdir>. */
const imageUpload = (subdir = "") =>
  multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = path.join(IMAGES_DIR, subdir);
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
      },
      // Random names: never reuse anything from the client-supplied name
      // except a whitelisted extension.
      filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`);
      },
    }),
    limits: { fileSize: config.uploads.maxImageBytes, files: 10 },
    fileFilter: (req, file, cb) => {
      const extension = path.extname(file.originalname).toLowerCase();

      if (IMAGE_EXTENSIONS.includes(extension) && IMAGE_MIME_TYPES.includes(file.mimetype))
        return cb(null, true);
      cb(badRequest("Yalnızca .jpg, .jpeg, .png, .gif ve .webp görseller yüklenebilir"));
    },
  });

const upload = imageUpload();

/**
 * Resolves a file name inside IMAGES_DIR. Rejects anything that would escape
 * the directory: the old handlers joined the raw parameter, so
 * DELETE /api/static-images/..%2Fmain.js deleted application files.
 */
const resolveImagePath = (filename) => {
  const name = path.basename(String(filename || ""));
  const filePath = path.join(IMAGES_DIR, name);

  if (!name || name !== filename || !IMAGE_EXTENSIONS.includes(path.extname(name).toLowerCase()))
    throw badRequest("Geçersiz dosya adı");
  return filePath;
};

const describe = (filename, stats) => ({
  filename,
  url: `/static/images/${filename}`,
  size: stats.size,
  extension: path.extname(filename).toLowerCase(),
  createdAt: stats.birthtime,
  modifiedAt: stats.mtime,
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
    if (!req.file) throw badRequest("Görsel dosyası yüklenmedi");

    res.status(200).json({
      message: "Image uploaded successfully",
      filename: req.file.filename,
      originalName: req.file.originalname,
      url: `/static/images/${req.file.filename}`,
      path: `images/${req.file.filename}`,
      size: req.file.size,
    });
  }

  // Upload multiple images
  static uploadMultiple(req, res) {
    if (!req.files?.length) throw badRequest("Görsel dosyası yüklenmedi");

    res.status(200).json({
      message: "Images uploaded successfully",
      files: req.files.map((file) => ({
        filename: file.filename,
        originalName: file.originalname,
        url: `/static/images/${file.filename}`,
        path: `images/${file.filename}`,
        size: file.size,
      })),
    });
  }

  // Get list of all static images
  static listImages(req, res) {
    if (!fs.existsSync(IMAGES_DIR)) return res.status(200).json({ images: [] });

    const images = fs
      .readdirSync(IMAGES_DIR, { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((file) => IMAGE_EXTENSIONS.includes(path.extname(file).toLowerCase()))
      .map((file) => describe(file, fs.statSync(path.join(IMAGES_DIR, file))));

    res.status(200).json({ images });
  }

  // Delete static image
  static deleteImage(req, res) {
    const filePath = resolveImagePath(req.params.filename);
    if (!fs.existsSync(filePath)) throw notFound("Görsel bulunamadı");

    fs.unlinkSync(filePath);
    res.status(200).json({ message: "Image deleted successfully", filename: req.params.filename });
  }

  // Get image info
  static getImageInfo(req, res) {
    const filePath = resolveImagePath(req.params.filename);
    if (!fs.existsSync(filePath)) throw notFound("Görsel bulunamadı");

    res.status(200).json(describe(req.params.filename, fs.statSync(filePath)));
  }
}

const wrapped = wrapController(StaticImageController);
// Middleware factories are called at route definition time, not per request.
wrapped.getUploadMiddleware = StaticImageController.getUploadMiddleware;
wrapped.getUploadMultipleMiddleware = StaticImageController.getUploadMultipleMiddleware;
wrapped.imageUpload = imageUpload;

module.exports = wrapped;
