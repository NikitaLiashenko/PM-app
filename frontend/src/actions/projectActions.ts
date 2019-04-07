import stores from '@/stores';

const getAllProjects = () => {
  return stores.managerStore.getAllUserProjects();
};

const createNewProject = (project : object) => {
  return stores.managerStore.createNewProject(project);
};

export default {
  getAllProjects,
  createNewProject
}