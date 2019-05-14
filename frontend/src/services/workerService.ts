import {apiClient} from '@/api/clients/clients';

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
  vacations?: Array<object>
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

export default {
  getProjectTeam,
  getAllWorkers,
  prepareProjectTeam,
  confirmProjectTeam
};