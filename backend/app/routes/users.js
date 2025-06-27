// const express = require("express");
// const User = require("../models/User");
// const authMiddleware = require("../utils/authMiddleware");
// const router = express.Router();

// // Tüm kullanıcıları getir
// router.get("/", async (req, res) => {
//   try {
//     const users = await User.query();
//     res.status(200).json({ users });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Sunucu hatası" });
//   }
// });

// // Belirli bir kullanıcıyı getir
// router.get("/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const user = await User.query().findById(id);
//     if (!user) {
//       return res.status(404).json({ error: "Kullanıcı bulunamadı" });
//     }
//     res.status(200).json({ user });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Sunucu hatası" });
//   }
// });

// // Kullanıcıyı güncelle
// router.put("/:id", authMiddleware, async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, email, password } = req.body;
//     const updatedUser = await User.query().patchAndFetchById(id, {
//       name,
//       email,
//       password,
//     });
//     res
//       .status(200)
//       .json({ message: "Kullanıcı güncellendi", user: updatedUser });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Sunucu hatası" });
//   }
// });

// // Kullanıcıyı sil
// router.delete("/:id", authMiddleware, async (req, res) => {
//   try {
//     const { id } = req.params;
//     await User.query().deleteById(id);
//     res.status(200).json({ message: "Kullanıcı silindi" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Sunucu hatası" });
//   }
// });

// module.exports = router;

const express = require("express");
const UserController = require("../controllers/userController");
const authMiddleware = require("../utils/authMiddleware");
const router = express.Router();

// Tüm kullanıcıları getir
router.get("/", authMiddleware, UserController.getAllUsers);

// Belirli bir kullanıcıyı getir
router.get("/:id", authMiddleware, UserController.getUserById);

// Kullanıcıyı güncelle
router.put("/:id", authMiddleware, UserController.updateUser);

// Kullanıcıyı sil
router.delete("/:id", authMiddleware, UserController.deleteUser);

// Business logic routes
// Başarı kazan
router.post(
  "/:id/achievements",
  authMiddleware,
  UserController.earnAchievement
);

// Kullanıcının başarılarını getir
router.get("/:id/achievements", authMiddleware, UserController.getAchievements);

// Eğitime kayıt ol
router.post("/:id/enrollments", authMiddleware, UserController.enrollTraining);

// Kullanıcının kayıtlı olduğu eğitimleri getir
router.get(
  "/:id/enrollments",
  authMiddleware,
  UserController.getUserEnrollments
);

// Eğitimi tamamla
router.post(
  "/:id/trainings/complete",
  authMiddleware,
  UserController.completeTraining
);

// Bölüm başlat
router.post("/:id/chapters/start", authMiddleware, UserController.startChapter);

// Bölüm tamamla
router.post(
  "/:id/chapters/complete",
  authMiddleware,
  UserController.completeChapter
);

// Yönerge getir (kullanıcı progress ile)
router.get(
  "/:id/instructions/:instructionId",
  authMiddleware,
  UserController.getInstruction
);

// Yazı getir (kullanıcı erişim bilgisi ile)
router.get(
  "/:id/writeups/:writeUpId",
  authMiddleware,
  UserController.getWriteUp
);

// Profil resmi yükle
router.post(
  "/:id/profile-image",
  authMiddleware,
  UserController.uploadProfileImage
);

module.exports = router;
