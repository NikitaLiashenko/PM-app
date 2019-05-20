import stores from '@/stores';
import {Project} from "@/services/projectService";

const getAllProjects = () => {
  return stores.adminStore.getAllProjects();
};

const cleanProjects = () => {
  return stores.adminStore.cleanProjects();
};

export default {
  getAllProjects,
  cleanProjects
}