const express = require("express");
const router = express.Router();

const StaticImageController = require("../controllers/staticImageController");

// Upload single image
router.post(
  "/upload",
  StaticImageController.getUploadMiddleware(),
  StaticImageController.uploadSingle
);

// Upload multiple images
router.post(
  "/upload-multiple",
  StaticImageController.getUploadMultipleMiddleware(),
  StaticImageController.uploadMultiple
);

// Get list of all static images
router.get("/list", StaticImageController.listImages);

// Get image info
router.get("/:filename/info", StaticImageController.getImageInfo);

// Delete static image
router.delete("/:filename", StaticImageController.deleteImage);

module.exports = router;
