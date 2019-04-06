import stores from '@/stores';

const getAllProjects = () => {
  return stores.managerStore.getAllUserProjects();
};

export default {
  getAllProjects
}