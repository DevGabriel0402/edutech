const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'termo-generator',
  location: 'southamerica-east1'
};
exports.connectorConfig = connectorConfig;

const listAllProjectsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAllProjects');
}
listAllProjectsRef.operationName = 'ListAllProjects';
exports.listAllProjectsRef = listAllProjectsRef;

exports.listAllProjects = function listAllProjects(dc) {
  return executeQuery(listAllProjectsRef(dc));
};

const createNewTaskRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateNewTask', inputVars);
}
createNewTaskRef.operationName = 'CreateNewTask';
exports.createNewTaskRef = createNewTaskRef;

exports.createNewTask = function createNewTask(dcOrVars, vars) {
  return executeMutation(createNewTaskRef(dcOrVars, vars));
};

const getMyTasksRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMyTasks');
}
getMyTasksRef.operationName = 'GetMyTasks';
exports.getMyTasksRef = getMyTasksRef;

exports.getMyTasks = function getMyTasks(dc) {
  return executeQuery(getMyTasksRef(dc));
};

const addCommentToIdeaRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AddCommentToIdea', inputVars);
}
addCommentToIdeaRef.operationName = 'AddCommentToIdea';
exports.addCommentToIdeaRef = addCommentToIdeaRef;

exports.addCommentToIdea = function addCommentToIdea(dcOrVars, vars) {
  return executeMutation(addCommentToIdeaRef(dcOrVars, vars));
};
