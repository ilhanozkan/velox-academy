const crypto = require("crypto");
const compute = require("@google-cloud/compute");

const config = require("../config/env");

// Instance metadata key the sandbox service (vm-image) reads its access token from.
const TOKEN_METADATA_KEY = "velox-sandbox-token";

// The Compute client uses the REST transport: google-gax maps HTTP 404 to gRPC
// code 5 but HTTP 409 to 10 (ABORTED), and errors reported inside a finished
// operation carry no code at all. Match on the message as well.
const isNotFound = (error) =>
  error?.code === 5 || error?.code === 404 || /was not found|\bnotFound\b/i.test(error?.message || "");
const isAlreadyExists = (error) =>
  error?.code === 6 ||
  error?.code === 409 ||
  /already exists|\balreadyExists\b/i.test(error?.message || "");

// Upper bound for one Compute Engine operation (create/delete).
const OPERATION_TIMEOUT_MS = 10 * 60 * 1000;

const gcp = () => config.sandbox.gcp;

/**
 * Compute Engine resource names must match [a-z]([-a-z0-9]*[a-z0-9])? and be
 * at most 63 characters. Training ids are free-form, so normalise them and
 * keep long names unique with a short hash suffix.
 */
const toResourceName = (value) => {
  let name = String(value)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[^a-z]+/, "")
    .replace(/-+$/, "");

  if (!name) name = "vm";

  if (name.length > 63) {
    const hash = crypto.createHash("sha1").update(String(value)).digest("hex").slice(0, 8);
    name = `${name.slice(0, 54).replace(/-+$/, "")}-${hash}`;
  }
  return name;
};

const toLabelValue = (value) =>
  String(value).toLowerCase().replace(/[^a-z0-9_-]/g, "-").slice(0, 63);

const userInstanceName = (userId, trainingId) =>
  toResourceName(`user-${userId}-training-${trainingId}-vm`);

const templateUrl = (templateName) =>
  `https://compute.googleapis.com/compute/v1/projects/${gcp().projectId}/global/instanceTemplates/${templateName}`;

const waitForOperation = async (response) => {
  let operation = response.latestResponse;
  const operationsClient = new compute.ZoneOperationsClient();
  const deadline = Date.now() + OPERATION_TIMEOUT_MS;

  while (operation.status !== "DONE") {
    if (Date.now() > deadline) throw new Error(`Operation ${operation.name} timed out`);
    [operation] = await operationsClient.wait({
      operation: operation.name,
      project: gcp().projectId,
      zone: operation.zone.split("/").pop(),
    });
  }

  if (operation.error?.errors?.length) {
    throw new Error(operation.error.errors.map((e) => e.message).join("; "));
  }
};

// Metadata given at insert time replaces the template's metadata entirely, so
// keep the template's items (e.g. its startup script) and add the token.
const templateMetadataWithToken = async (templateName, accessToken) => {
  const templatesClient = new compute.InstanceTemplatesClient();
  const [template] = await templatesClient.get({
    project: gcp().projectId,
    instanceTemplate: templateName,
  });

  const items = (template.properties?.metadata?.items || []).filter(
    (item) => item.key !== TOKEN_METADATA_KEY
  );
  return { items: [...items, { key: TOKEN_METADATA_KEY, value: accessToken }] };
};

const getVmExternalIp = async (instanceName = gcp().instanceTemplate) => {
  const computeClient = new compute.InstancesClient();

  try {
    const [instance] = await computeClient.get({
      instance: instanceName,
      project: gcp().projectId,
      zone: gcp().zone,
    });

    const publicIp = instance.networkInterfaces?.[0]?.accessConfigs?.[0]?.natIP;
    if (!publicIp) throw new Error("VM has no external IP address");

    return publicIp;
  } catch (error) {
    console.error(`Failed to get IP for VM ${instanceName}:`, error.message);
    throw new Error(`Failed to get VM IP: ${error.message}`);
  }
};

async function deleteUserVM(instanceName) {
  const instancesClient = new compute.InstancesClient();

  try {
    console.log(`Deleting VM ${instanceName} in ${gcp().zone}...`);
    const [response] = await instancesClient.delete({
      project: gcp().projectId,
      zone: gcp().zone,
      instance: instanceName,
    });
    await waitForOperation(response);
    console.log(`VM ${instanceName} deleted successfully.`);
  } catch (error) {
    // Already gone: nothing to clean up.
    if (isNotFound(error)) return { status: "deleted", instanceName };

    console.error(`Failed to delete VM ${instanceName}:`, error.message);
    throw new Error(`VM deletion failed: ${error.message}`);
  }

  return { status: "deleted", instanceName };
}

/**
 * Creates a sandbox VM from an instance template and returns its address.
 * If a VM with the same name survived an earlier failed attempt it is
 * replaced, because it would still hold the previous access token.
 */
async function createUserVM({ instanceName, templateName, accessToken, labels = {} }) {
  const instancesClient = new compute.InstancesClient();
  const template = templateName || gcp().instanceTemplate;

  const insert = async () => {
    const [response] = await instancesClient.insert({
      project: gcp().projectId,
      zone: gcp().zone,
      instanceResource: {
        name: instanceName,
        labels: Object.fromEntries(
          Object.entries({ ...labels, "vm-type": "training-sandbox" }).map(([k, v]) => [
            k,
            toLabelValue(v),
          ])
        ),
        ...(accessToken && {
          metadata: await templateMetadataWithToken(template, accessToken),
        }),
      },
      sourceInstanceTemplate: templateUrl(template),
    });
    await waitForOperation(response);
  };

  console.log(`Creating VM ${instanceName} in ${gcp().zone} from template ${template}...`);

  try {
    await insert();
  } catch (error) {
    if (!isAlreadyExists(error)) {
      console.error(`Failed to create VM ${instanceName}:`, error.message);
      throw new Error(`VM creation failed: ${error.message}`);
    }

    console.warn(`VM ${instanceName} already exists, recreating it.`);
    await deleteUserVM(instanceName);
    await insert();
  }

  console.log(`VM ${instanceName} created successfully.`);

  return {
    instanceName,
    externalIp: await getVmExternalIp(instanceName),
    zone: gcp().zone,
    projectId: gcp().projectId,
  };
}

/** Creates the VM used to build the sandbox image (admin only). */
async function createVM() {
  const { instanceTemplate } = gcp();
  const instancesClient = new compute.InstancesClient();

  console.log(`Creating the ${instanceTemplate} instance in ${gcp().zone}...`);

  const [response] = await instancesClient.insert({
    project: gcp().projectId,
    zone: gcp().zone,
    instanceResource: { name: toResourceName(instanceTemplate) },
    sourceInstanceTemplate: templateUrl(instanceTemplate),
  });
  await waitForOperation(response);

  console.log("Instance created.");
  return getVmExternalIp(toResourceName(instanceTemplate));
}

module.exports = {
  TOKEN_METADATA_KEY,
  toResourceName,
  userInstanceName,
  getVmExternalIp,
  createVM,
  createUserVM,
  deleteUserVM,
};
