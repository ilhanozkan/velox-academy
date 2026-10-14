const UserSandboxService = require("../services/userSandboxService");
const TrainingService = require("../services/trainingService");
const { badRequest, notFound, wrapController } = require("../utils/httpError");

const serialize = (sandbox) => UserSandboxService.serialize(sandbox, { includeToken: true });

// Every handler is scoped to the logged-in user's own sandboxes.
class UserSandboxController {
  static async createSandbox(req, res) {
    const { trainingId } = req.body || {};
    if (!trainingId) throw badRequest("Training ID is required");

    if (!(await TrainingService.isUserEnrolled(trainingId, req.user.userId)))
      throw notFound("Bu eğitime kayıtlı değilsiniz");

    const sandbox = await UserSandboxService.ensureSandbox(req.user.userId, trainingId);
    res.status(202).json({ message: "Sandbox oluşturuluyor", sandbox: serialize(sandbox) });
  }

  static async getUserSandboxes(req, res) {
    const sandboxes = await UserSandboxService.getUserSandboxes(req.user.userId);
    res.status(200).json({ sandboxes: sandboxes.map(serialize) });
  }

  static async getSandbox(req, res) {
    const { trainingId } = req.query;
    if (!trainingId) throw badRequest("Training ID is required");

    const sandbox = await UserSandboxService.getUserSandbox(req.user.userId, trainingId);
    if (!sandbox) throw notFound("Sandbox bulunamadı");
    res.status(200).json({ sandbox: serialize(sandbox) });
  }

  static async deleteSandbox(req, res) {
    const { trainingId } = req.body || {};
    if (!trainingId) throw badRequest("Training ID is required");

    const result = await UserSandboxService.deleteUserSandbox(req.user.userId, trainingId);
    res.status(200).json({ message: "Sandbox silindi", result });
  }

  // Previously these two accepted any sandbox id, so any user could recreate
  // or inspect someone else's VM.
  static async recreateSandbox(req, res) {
    const owned = await UserSandboxService.findOwned(req.params.id, req.currentUser);
    if (!(await TrainingService.isUserEnrolled(owned.training_id, owned.user_id)))
      throw notFound("Bu eğitime kayıtlı değilsiniz");

    const sandbox = await UserSandboxService.ensureSandbox(owned.user_id, owned.training_id, {
      recreate: true,
    });
    res.status(202).json({ message: "Sandbox yeniden oluşturuluyor", sandbox: serialize(sandbox) });
  }

  static async refreshSandboxIP(req, res) {
    const owned = await UserSandboxService.findOwned(req.params.id, req.currentUser);
    const sandbox = await UserSandboxService.refreshSandboxIP(owned);
    res.status(200).json({ message: "Sandbox IP adresi yenilendi", sandbox: serialize(sandbox) });
  }
}

module.exports = wrapController(UserSandboxController);
