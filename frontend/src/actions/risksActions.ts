import stores from '@/stores';
import {Risk} from '@/services/riskService';

const getProjectRisks = (projectId : string) => {
  return stores.managerStore.getAllProjectRisks(projectId);
};

const getProjectRisk = (projectId : string, riskId : string) => {
  return stores.managerStore.getProjectRisk(projectId, riskId);
};

const createProjectRisk = (risk : Risk) => {
  return stores.managerStore.createRisk(risk);
};

const updateProjectRisk = (riskId : string, risk : Risk) => {
  return stores.managerStore.updateRisk(riskId, risk);
};

const deleteProjectRisk = () => {
  return stores.managerStore.deleteRisk();
};

const cleanRisks = () => {
  return stores.managerStore.cleanRisks();
};

const cleanRisk = () => {
  return stores.managerStore.cleanRisk();
};

export default {
  getProjectRisks,
  getProjectRisk,
  createProjectRisk,
  updateProjectRisk,
  deleteProjectRisk,
  cleanRisk,
  cleanRisks
};