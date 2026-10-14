const Image = require("../models/Image");
const { notFound } = require("../utils/httpError");

// Columns an admin may set on a sandbox image record.
const IMAGE_FIELDS = ["id", "name", "file_path", "file_id", "sandbox_id"];

class ImageService {
  static get FIELDS() {
    return IMAGE_FIELDS;
  }

  static async getAllImages() {
    return await Image.query();
  }

  static async getImageById(id) {
    return await Image.query().findById(id);
  }

  static async createImage(imageData) {
    return await Image.query().insert(imageData);
  }

  static async updateImage(id, imageData) {
    const { id: _ignored, ...changes } = imageData;
    const image = await Image.query().patchAndFetchById(id, changes);
    if (!image) throw notFound("İmaj bulunamadı");
    return image;
  }

  // Business logic methods based on UML diagram
  static async uploadImage(imageData) {
    // Registers an image record; the binary goes through /api/static-images.
    const uploadedImage = await Image.query().insert(imageData);

    return {
      image: uploadedImage,
      uploadUrl: `/api/images/${uploadedImage.id}`,
      status: "uploaded",
    };
  }

  static async deleteImage(id) {
    const deleted = await Image.query().deleteById(id);
    if (!deleted) throw notFound("İmaj bulunamadı");

    return { imageId: id, deletedAt: new Date(), status: "deleted" };
  }
}

module.exports = ImageService;
