const compute = require("@google-cloud/compute");

const projectId = "primal-gear-461809-v7";
const zone = "europe-west1-b";
const templateName = "velox-images-sql-101";
const instanceTemplateUrl = `https://compute.googleapis.com/compute/v1/projects/${projectId}/global/instanceTemplates/${templateName}`;

async function createUserVM(userId, trainingId) {
  const instanceName = `user-${userId}-training-${trainingId}-vm`;
  const instancesClient = new compute.InstancesClient();

  console.log(
    `Creating VM ${instanceName} in ${zone} for user ${userId} training ${trainingId}...`
  );

  try {
    const [response] = await instancesClient.insert({
      project: projectId,
      zone,
      instanceResource: {
        name: instanceName,
        labels: {
          "user-id": userId.toString(),
          "training-id": trainingId.toString(),
          "vm-type": "training-sandbox",
        },
      },
      sourceInstanceTemplate: instanceTemplateUrl,
    });

    let operation = response.latestResponse;
    const operationsClient = new compute.ZoneOperationsClient();

    while (operation.status !== "DONE") {
      [operation] = await operationsClient.wait({
        operation: operation.name,
        project: projectId,
        zone: operation.zone.split("/").pop(),
      });
    }

    console.log(`VM ${instanceName} created successfully.`);

    const externalIp = await getVmExternalIp(instanceName);

    return {
      instanceName,
      externalIp,
      zone,
      projectId,
      status: "running",
    };
  } catch (error) {
    console.error(`Failed to create VM for user ${userId}:`, error);
    throw new Error(`VM creation failed: ${error.message}`);
  }
}

async function createVM() {
  const instanceName = "velox-images-sql-101";
  const instancesClient = new compute.InstancesClient();
  console.log(
    `Creating the ${instanceName} instance in ${zone} from template ${instanceTemplateUrl}...`
  );

  const [response] = await instancesClient.insert({
    project: projectId,
    zone,
    instanceResource: {
      name: instanceName,
    },
    sourceInstanceTemplate: instanceTemplateUrl,
  });
  let operation = response.latestResponse;
  const operationsClient = new compute.ZoneOperationsClient();

  while (operation.status !== "DONE") {
    [operation] = await operationsClient.wait({
      operation: operation.name,
      project: projectId,
      zone: operation.zone.split("/").pop(),
    });
  }

  console.log("Instance created.");

  return getVmExternalIp(templateName);
}

const getVmExternalIp = async (instanceName = templateName) => {
  const { InstancesClient } = require("@google-cloud/compute");

  const computeClient = new InstancesClient();

  try {
    const the_compute_instance = await computeClient.get({
      instance: instanceName,
      project: projectId,
      zone,
    });

    const public_ip =
      the_compute_instance[0]["networkInterfaces"][0]["accessConfigs"][0][
        "natIP"
      ];

    console.log(`VM ${instanceName} IP: http://${public_ip}`);

    return public_ip;
  } catch (error) {
    console.error(`Failed to get IP for VM ${instanceName}:`, error);
    throw new Error(`Failed to get VM IP: ${error.message}`);
  }
};

async function deleteUserVM(instanceName) {
  const instancesClient = new compute.InstancesClient();

  try {
    console.log(`Deleting VM ${instanceName} in ${zone}...`);

    const [response] = await instancesClient.delete({
      project: projectId,
      zone,
      instance: instanceName,
    });

    let operation = response.latestResponse;
    const operationsClient = new compute.ZoneOperationsClient();

    while (operation.status !== "DONE") {
      [operation] = await operationsClient.wait({
        operation: operation.name,
        project: projectId,
        zone: operation.zone.split("/").pop(),
      });
    }

    console.log(`VM ${instanceName} deleted successfully.`);
    return { status: "deleted", instanceName };
  } catch (error) {
    console.error(`Failed to delete VM ${instanceName}:`, error);
    throw new Error(`VM deletion failed: ${error.message}`);
  }
}

module.exports.getVmExternalIp = getVmExternalIp;
module.exports.createVM = createVM;
module.exports.createUserVM = createUserVM;
module.exports.deleteUserVM = deleteUserVM;
