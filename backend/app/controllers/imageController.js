const ImageService = require("../services/imageService");

class ImageController {
  static async getAllImages(req, res) {
    try {
      const images = await ImageService.getAllImages();
      res.status(200).json({ images });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async getImageById(req, res) {
    try {
      const { id } = req.params;
      const image = await ImageService.getImageById(id);
      if (!image) {
        return res.status(404).json({ error: "İmaj bulunamadı" });
      }
      res.status(200).json({ image });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async createImage(req, res) {
    try {
      const imageData = req.body;
      const newImage = await ImageService.createImage(imageData);
      res.status(201).json({ message: "İmaj oluşturuldu", image: newImage });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async updateImage(req, res) {
    try {
      const { id } = req.params;
      const imageData = req.body;
      const updatedImage = await ImageService.updateImage(id, imageData);
      res
        .status(200)
        .json({ message: "İmaj güncellendi", image: updatedImage });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async deleteImage(req, res) {
    try {
      const { id } = req.params;
      const result = await ImageService.deleteImage(id);
      res.status(200).json({
        message: "İmaj silindi",
        deletion: result,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }

  // Business logic endpoints
  static async uploadImage(req, res) {
    try {
      const imageData = req.body;
      const result = await ImageService.uploadImage(imageData);
      res.status(200).json({
        message: "İmaj yüklendi",
        upload: result,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }
}

module.exports = ImageController;
