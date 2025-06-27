const Sandbox = require("../models/Sandbox");

class SandboxService {
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
    return await Sandbox.query().patchAndFetchById(id, sandboxData);
  }

  static async deleteSandbox(id) {
    await Sandbox.query().deleteById(id);
  }

  // Business logic methods based on UML diagram
  static async initiateImage(sandboxId) {
    const sandbox = await Sandbox.query()
      .findById(sandboxId)
      .withGraphFetched("image");

    if (!sandbox) {
      throw new Error("Sandbox not found");
    }

    if (!sandbox.image) {
      throw new Error("No image associated with this sandbox");
    }

    // In a real implementation, this would start a container/VM with the image
    // For now, we'll return initiation information
    return {
      sandboxId: sandbox.id,
      imageId: sandbox.image.id,
      status: "initiating",
      initiatedAt: new Date(),
      accessUrl: `http://sandbox-${sandbox.id}.local`,
      ports: [8080, 3000, 5000], // Example ports
    };
  }

  static async stopImage(sandboxId) {
    const sandbox = await Sandbox.query()
      .findById(sandboxId)
      .withGraphFetched("image");

    if (!sandbox) {
      throw new Error("Sandbox not found");
    }

    // In a real implementation, this would stop the running container/VM
    return {
      sandboxId: sandbox.id,
      imageId: sandbox.image ? sandbox.image.id : null,
      status: "stopped",
      stoppedAt: new Date(),
    };
  }
}

module.exports = SandboxService;
