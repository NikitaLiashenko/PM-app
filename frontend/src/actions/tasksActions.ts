import stores from '@/stores';

const getProjectTasks = (projectId : string) => {
  return stores.managerStore.getAllProjectTasks(projectId);
};

const getProjectTask = (projectId : string, taskId : string) => {
  return stores.managerStore.getProjectTask(projectId, taskId);
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
  cleanTasks,
  cleanTask
};