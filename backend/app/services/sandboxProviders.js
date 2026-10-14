const crypto = require("crypto");

const config = require("../config/env");
const { serviceUnavailable } = require("../utils/httpError");
const {
  userInstanceName,
  createUserVM,
  deleteUserVM,
  getVmExternalIp,
} = require("./vmServices");

/**
 * A provider knows how to create, reach and delete a learner's sandbox.
 * Every user_sandboxes row records the provider that created it, so rows keep
 * working if SANDBOX_PROVIDER changes later.
 */

// One Compute Engine VM per learner and training, created from an instance
// template. Each VM gets its own random access token through instance metadata.
const gcpProvider = {
  name: "gcp",
  instanceName: userInstanceName,
  createAccessToken: () => crypto.randomBytes(24).toString("hex"),

  async create(sandbox, training) {
    const vm = await createUserVM({
      instanceName: sandbox.vm_instance_name,
      templateName: training?.sandbox_template,
      accessToken: sandbox.access_token,
      labels: { "user-id": sandbox.user_id, "training-id": sandbox.training_id },
    });

    return { vm_external_ip: vm.externalIp, vm_zone: vm.zone, project_id: vm.projectId };
  },

  destroy: (sandbox) => deleteUserVM(sandbox.vm_instance_name),

  async refresh(sandbox) {
    return { vm_external_ip: await getVmExternalIp(sandbox.vm_instance_name) };
  },

  accessUrl: (sandbox) =>
    sandbox.vm_external_ip ? `http://${sandbox.vm_external_ip}:${config.sandbox.port}` : null,
};

// Development: every learner shares the sandbox service started from
// vm-image/ (docker compose in vm-image/.docker.dev, or `npm run dev`).
const localProvider = {
  name: "local",
  instanceName: (userId, trainingId) => `local-user-${userId}-${trainingId}`,
  createAccessToken: () => config.sandbox.local.token,
  create: async () => ({}),
  destroy: async () => {},
  refresh: async () => ({}),
  accessUrl: () => config.sandbox.local.url,
};

const PROVIDERS = { gcp: gcpProvider, local: localProvider };

/** The provider new sandboxes are created with. */
const activeProvider = () => {
  const provider = PROVIDERS[config.sandbox.provider];

  if (!provider)
    throw serviceUnavailable(
      "Sanal laboratuvar ortamları şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin."
    );
  return provider;
};

/** The provider an existing sandbox was created with. */
const providerFor = (sandbox) => PROVIDERS[sandbox.provider] || gcpProvider;

module.exports = { activeProvider, providerFor, PROVIDERS };
