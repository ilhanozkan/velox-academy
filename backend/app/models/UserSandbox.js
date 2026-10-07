const BaseModel = require("./BaseModel");

class UserSandbox extends BaseModel {
  static get tableName() {
    return "user_sandboxes";
  }

  static get STATUSES() {
    return ["creating", "running", "stopped", "deleted", "error"];
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["user_id", "training_id", "vm_instance_name"],
      properties: {
        id: { type: "integer" },
        user_id: { type: "integer" },
        training_id: { type: "string" },
        provider: { type: "string", maxLength: 32 },
        vm_instance_name: { type: "string", minLength: 1, maxLength: 255 },
        vm_external_ip: { type: ["string", "null"], maxLength: 255 },
        vm_status: { type: "string", enum: UserSandbox.STATUSES },
        vm_zone: { type: ["string", "null"] },
        project_id: { type: ["string", "null"] },
        access_token: { type: ["string", "null"], maxLength: 128 },
        error_message: { type: ["string", "null"] },
      },
    };
  }

  static get relationMappings() {
    const User = require("./User");
    const Training = require("./Training");

    return {
      user: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "user_sandboxes.user_id",
          to: "users.id",
        },
      },
      training: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Training,
        join: {
          from: "user_sandboxes.training_id",
          to: "trainings.id",
        },
      },
    };
  }

  // The access token is a credential for the sandbox VM; never serialize it
  // implicitly. Callers that must hand it to the owner read it explicitly.
  $formatJson(json) {
    json = super.$formatJson(json);
    delete json.access_token;
    return json;
  }
}

module.exports = UserSandbox;
