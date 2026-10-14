const express = require("express");

const UserController = require("../controllers/userController");
const { imageUpload } = require("../controllers/staticImageController");
const UserService = require("../services/userService");
const { requireAdmin, requireSelfOrAdmin } = require("../middleware/auth");
const router = express.Router();

const self = requireSelfOrAdmin("id");
const avatarUpload = imageUpload(UserService.AVATAR_DIR).single("image");

// Tüm kullanıcıları getir
router.get("/", requireAdmin, UserController.getAllUsers);

// Belirli bir kullanıcıyı getir
router.get("/:id", self, UserController.getUserById);

// Kullanıcıyı güncelle
router.put("/:id", self, UserController.updateUser);

// Kullanıcıyı sil
router.delete("/:id", self, UserController.deleteUser);

// Business logic routes
// Başarı kazan (yönetici)
router.post("/:id/achievements", requireAdmin, UserController.earnAchievement);

// Kullanıcının başarılarını getir
router.get("/:id/achievements", self, UserController.getAchievements);

// Eğitime kayıt ol
router.post("/:id/enrollments", self, UserController.enrollTraining);

// Kullanıcının kayıtlı olduğu eğitimleri getir
router.get("/:id/enrollments", self, UserController.getUserEnrollments);

// Kullanıcının istatistikleri
router.get("/:id/stats", self, UserController.getStats);

// Eğitimi tamamla
router.post("/:id/trainings/complete", self, UserController.completeTraining);

// Bölüm başlat
router.post("/:id/chapters/start", self, UserController.startChapter);

// Bölüm tamamla
router.post("/:id/chapters/complete", self, UserController.completeChapter);

// Yönerge getir (kullanıcı progress ile)
router.get("/:id/instructions/:instructionId", self, UserController.getInstruction);

// Yazı getir (kullanıcı erişim bilgisi ile)
router.get("/:id/writeups/:writeUpId", self, UserController.getWriteUp);

// Profil resmi yükle (multipart/form-data, alan adı: "image")
router.post("/:id/profile-image", self, avatarUpload, UserController.uploadProfileImage);

// Profil resmini kaldır
router.delete("/:id/profile-image", self, UserController.removeProfileImage);

module.exports = router;
