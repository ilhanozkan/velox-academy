const ImageService = require("../services/imageService");
const { notFound, pick, wrapController } = require("../utils/httpError");

class ImageController {
  static async getAllImages(req, res) {
    const images = await ImageService.getAllImages();
    res.status(200).json({ images });
  }

  static async getImageById(req, res) {
    const image = await ImageService.getImageById(req.params.id);
    if (!image) throw notFound("İmaj bulunamadı");
    res.status(200).json({ image });
  }

  static async createImage(req, res) {
    const image = await ImageService.createImage(pick(req.body, ImageService.FIELDS));
    res.status(201).json({ message: "İmaj oluşturuldu", image });
  }

  static async updateImage(req, res) {
    const image = await ImageService.updateImage(
      req.params.id,
      pick(req.body, ImageService.FIELDS)
    );
    res.status(200).json({ message: "İmaj güncellendi", image });
  }

  static async deleteImage(req, res) {
    const deletion = await ImageService.deleteImage(req.params.id);
    res.status(200).json({ message: "İmaj silindi", deletion });
  }

  // Business logic endpoints
  static async uploadImage(req, res) {
    const upload = await ImageService.uploadImage(pick(req.body, ImageService.FIELDS));
    res.status(200).json({ message: "İmaj yüklendi", upload });
  }
}

module.exports = wrapController(ImageController);
