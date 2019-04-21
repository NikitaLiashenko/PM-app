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

export default {
  getProjectTeam
};