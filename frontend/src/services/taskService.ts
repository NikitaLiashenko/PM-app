import {authClient, apiClient} from '@/api/clients/clients';

export type Task = {
  taskId? : string,
  summary? : string,
  crashCost? : number,
  earlyFinish?:	number,
  earlyStart?: number,
  endDate?:	string,
  estimateMax?:	number,
  estimateMin?:	number,
  finishFloat?:	number,
  freeFloat?:	number,
  isOnCritPath?: boolean,
  lateFinish?: number,
  lateStart?:	number,
  orderId?:	number,
  predecessor? : Array<string>,
  startDate?:	string,
  startFloat?: number,
  taskCost?: number,
  taskType?: string,
  workType?: string,
  progress? : number,
  components? : Array<string>,
  priority? : string,
  assignee? : string,
  labels? : Array<string>,
  description? : string,
  comments? : Array<string>,
  reporter? : string,
  sprint? : string,
  status? : string
};

const getAllProjectTasks = async(projectId : string) : Promise<Array<Task>> => {
  const response = await apiClient.get(`/project/${projectId}/task`);

  return response.data;
};

const getProjectTask = async(projectId : string, taskId : string) : Promise<Task> => {
  const response = await apiClient.get(`/project/${projectId}/task/${taskId}`);

  return response.data;
};

const createProjectTask = async(projectId : string, task : Task) : Promise<object> => {
  const response = await apiClient.post(`/project/${projectId}/task`, task);

  return response.data;
};

const updateProjectTask = async(projectId : string, taskId : string, task : Task) : Promise<object> => {
  const response = await apiClient.put(`/project/${projectId}/task/${taskId}`, task);

  return response.data;
};

const deleteProjectTask = async(projectId : string, taskId : string) : Promise<object> => {
  const response = await apiClient.delete(`/project/${projectId}/task/${taskId}`);

  return response.data;
};

export default {
  getAllProjectTasks,
  getProjectTask,
  createProjectTask,
  updateProjectTask,
  deleteProjectTask
};