import {apiClient} from '@/api/clients/clients';

type Vacation = {
  startDate : string,
  endDate : string
};

export type Worker = {
  firstName?: string,
  lastName?: string,
  location?: string,
  mainSkill?: string,
  project?: {
    endDate?: string,
    projectId?: string
  },
  role?: string,
  seniorityLevel?: string,
  skills?: Array<string>,
  username?: string,
  vacations?: Array<Vacation>
};

const getProjectTeam = async(projectId : string) : Promise<Array<Worker>> => {
  const response = await apiClient.get(`/project/${projectId}/team`);

  return response.data;
};

const getAllWorkers = async() : Promise<Array<Worker>> => {
  const response = await apiClient.get('/worker');

  return response.data;
};

const prepareProjectTeam = async(teamParams : any, projectId : string) : Promise<Array<Worker>> => {
  const response = await apiClient.post(`/project/${projectId}/team`, teamParams);

  return response.data;
};

const confirmProjectTeam = async(team : Array<Worker>, projectId : string) => {
  const response = await apiClient.put(`/project/${projectId}/team`, team);

  return response.data;
};

const getWorker = async(workerId : string) : Promise<Worker> => {
  const response = await apiClient.get(`/worker/${workerId}`);

  return response.data;
};

const createWorker = async(worker : Worker) : Promise<any> => {
  const response = await apiClient.post('/worker', worker);

  return response.data;
};

const updateWorker = async(workerId : string, worker : Worker) : Promise<Worker> => {
  const response = await apiClient.put(`/worker/${workerId}`, worker);

  return response.data;
};

const deleteWorker = async(workerId : string) : Promise<any> => {
  const response = await apiClient.delete(`/worker/${workerId}`);

  return response.data;
};

export default {
  getProjectTeam,
  getAllWorkers,
  prepareProjectTeam,
  confirmProjectTeam,
  getWorker,
  createWorker,
  updateWorker,
  deleteWorker
};