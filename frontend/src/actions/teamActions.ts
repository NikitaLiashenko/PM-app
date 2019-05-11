import stores from '@/stores';

const getProjectTeam = () => {
  return stores.managerStore.getProjectTeam();
};

const cleanProjectTeam = () => {
  return stores.managerStore.cleanProjectTeam();
};

const getAllWorkers = () => {
  return stores.managerStore.getAllWorkers();
};

const cleanWorkers = () => {
  return stores.managerStore.cleanWorkers();
};

export default {
  getProjectTeam,
  cleanProjectTeam,
  getAllWorkers,
  cleanWorkers
};