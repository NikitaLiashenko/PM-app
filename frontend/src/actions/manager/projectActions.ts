import stores from '@/stores';
import {Project} from "@/services/projectService";

const getAllProjects = () => {
  return stores.managerStore.getAllUserProjects();
};

const createNewProject = (project : object) => {
  return stores.managerStore.createNewProject(project);
};

const getProject = (projectId : string) => {
  return stores.managerStore.getProject(projectId);
};

const updateProject = (project : Project, projectId : string) => {
  return stores.managerStore.updateProject(project, projectId);
};

const cleanProject = () => {
  return stores.managerStore.cleanProject();
};

const cleanProjectsList = () => {
  return stores.managerStore.cleanProjectsList();
};

const countCriticalPath = () => {
  return stores.managerStore.countCriticalPath();
};

const countProjectDates = () => {
  return stores.managerStore.countProjectDates();
};

export default {
  getAllProjects,
  createNewProject,
  getProject,
  updateProject,
  cleanProject,
  cleanProjectsList,
  countCriticalPath,
  countProjectDates
}