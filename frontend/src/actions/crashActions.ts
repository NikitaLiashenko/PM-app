import stores from '@/stores';

const getProjectCrash = (projectId : string) => {
  return stores.managerStore.getProjectCrash(projectId);
};

const getProjectStateInCrash = (projectId : string, crashId : string) => {
  return stores.managerStore.getProjectStateInCrash(projectId, crashId);
};

const confirmProjectCrash = (projectId : string, crashId : string) => {
  return stores.managerStore.confirmProjectCrash(projectId, crashId);
};

const cleanProjectCrash = () => {
  return stores.managerStore.cleanProjectCrash();
};

const cleanProjectStateInCrash = () => {
  return stores.managerStore.cleanProjectStateInCrash();
};

export default {
  getProjectCrash,
  getProjectStateInCrash,
  confirmProjectCrash,
  cleanProjectCrash,
  cleanProjectStateInCrash
};