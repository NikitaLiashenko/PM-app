import {apiClient} from '@/api/clients/clients';
import {Project} from "@/services/projectService";

export type Crash = any;

const getProjectCrash = async(projectId : string) : Promise<Array<Crash>> => {
  const response = await apiClient.post(`/project/${projectId}/crash`);

  return response.data;
};

const getProjectStateInCrash = async(projectId : string, crashId : string) : Promise<Project> => {
  const response = await apiClient.get(`/project/${projectId}/crash/${crashId}`);

  return response.data;
};

const confirmProjectCrash = async(projectId : string, crashId : string) : Promise<Project> => {
  const response = await apiClient.post(`/project/${projectId}/crash/${crashId}`);

  return response.data;
};

export default {
  getProjectCrash,
  getProjectStateInCrash,
  confirmProjectCrash
};