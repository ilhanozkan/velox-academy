const Image = require("../models/Image");

class ImageService {
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
    return await Image.query().patchAndFetchById(id, imageData);
  }

  // Business logic methods based on UML diagram
  static async uploadImage(imageData) {
    // In a real implementation, this would handle file upload to storage
    // For now, we'll simulate the upload process
    const uploadedImage = await Image.query().insert({
      ...imageData,
      uploadedAt: new Date(),
    });

    return {
      image: uploadedImage,
      uploadUrl: `/api/images/${uploadedImage.id}`,
      status: "uploaded",
    };
  }

  static async deleteImage(id) {
    const image = await Image.query().findById(id);

    if (!image) {
      throw new Error("Image not found");
    }

    // In a real implementation, this would also delete the physical file
    await Image.query().deleteById(id);

    return {
      imageId: id,
      deletedAt: new Date(),
      status: "deleted",
    };
  }
}

module.exports = ImageService;
