import stores from '@/stores';
import {Task} from "@/services/taskService";

const getProjectTasks = (projectId : string) => {
  return stores.managerStore.getAllProjectTasks(projectId);
};

const getProjectTask = (projectId : string, taskId : string) => {
  return stores.managerStore.getProjectTask(projectId, taskId);
};

const createProjectTask = (task : Task) => {
  return stores.managerStore.createTask(task);
};

const updateProjectTask = (task : Task) => {
  return stores.managerStore.updateTask(task);
};

const deleteProjectTask = () => {
  return stores.managerStore.deleteTask();
};

const cleanTasks = () => {
  return stores.managerStore.cleanTasks();
};

const cleanTask = () => {
  return stores.managerStore.cleanTask();
};

export default {
  getProjectTasks,
  getProjectTask,
  createProjectTask,
  updateProjectTask,
  deleteProjectTask,
  cleanTasks,
  cleanTask
};