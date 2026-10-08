const Sandbox = require("../models/Sandbox");
const { notFound } = require("../utils/httpError");

// Columns an admin may set on a chapter sandbox definition.
const SANDBOX_FIELDS = ["id", "name", "description", "image_file_path", "chapter_id"];

/**
 * Chapter sandbox definitions (which image a chapter uses). The VMs learners
 * actually work in are user sandboxes, see userSandboxService.js.
 */
class SandboxService {
  static get FIELDS() {
    return SANDBOX_FIELDS;
  }

  static async getAllSandboxes() {
    return await Sandbox.query();
  }

  static async getSandboxById(id) {
    return await Sandbox.query().findById(id);
  }

  static async createSandbox(sandboxData) {
    return await Sandbox.query().insert(sandboxData);
  }

  static async updateSandbox(id, sandboxData) {
    const { id: _ignored, ...changes } = sandboxData;
    const sandbox = await Sandbox.query().patchAndFetchById(id, changes);
    if (!sandbox) throw notFound("Sandbox bulunamadı");
    return sandbox;
  }

  static async deleteSandbox(id) {
    const deleted = await Sandbox.query().deleteById(id);
    if (!deleted) throw notFound("Sandbox bulunamadı");
  }

  // Business logic methods based on UML diagram. These describe the image a
  // sandbox definition uses; they used to return made-up URLs and ports.
  static async initiateImage(sandboxId) {
    const sandbox = await Sandbox.query()
      .findById(sandboxId)
      .withGraphFetched("image");

    if (!sandbox) throw notFound("Sandbox bulunamadı");
    if (!sandbox.image) throw notFound("Bu sandbox ile ilişkili bir imaj yok");

    return {
      sandboxId: sandbox.id,
      imageId: sandbox.image.id,
      imageFilePath: sandbox.image.file_path,
      status: "ready",
    };
  }

  static async stopImage(sandboxId) {
    const sandbox = await Sandbox.query()
      .findById(sandboxId)
      .withGraphFetched("image");

    if (!sandbox) throw notFound("Sandbox bulunamadı");

    return {
      sandboxId: sandbox.id,
      imageId: sandbox.image ? sandbox.image.id : null,
      status: "stopped",
    };
  }
}

module.exports = SandboxService;
