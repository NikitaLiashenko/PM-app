import {apiClient} from '@/api/clients/clients';

export type Project = {
  projectId? : string,
  title? : string,
  description? : string,
  client? : string,
  technologies? : Array<string>,
  startDate? : string,
  endDate? : string,
  hoursSpent? : number,
  hoursEstimated? : number,
  projectCost? : number,
  payed? : number,
  crash? : Array<object>,
  graph? : Array<Array<number>>,
  history? : Array<object>,
  overheadCostPerDay? : number,
  projectDuration? : number,
  risks? : Array<object>,
  tasks? : Array<object>,
  ui? : any
};

const getAllProject = async () : Promise<Project> => {
  const response = await apiClient.get('/project');

  return response.data;
};

const createProject = async(project : Project) : Promise<object> => {
  const response = await apiClient.post('/project', project);

  return response.data;
};

const getProject = async(projectId : string) : Promise<Project> => {
  const response = await apiClient.get(`/project/${projectId}`);

  return response.data;
};

const updateProject = async (project : Project, projectId : string) : Promise<Project> => {
  const response = await apiClient.put(`/project/${projectId}`, project);

  return response.data;
};

const countCriticalPath = async(projectId : string) : Promise<object> => {
  const response = await apiClient.post(`/project/${projectId}/criticalPath`);

  return response.data;
};

const countProjectDates = async(projectId : string, locations : Array<string>) : Promise<object> => {
  const response = await apiClient.post(`/project/${projectId}/dates`, {locations});

  return response.data;
};

export default {
  getAllProject,
  createProject,
  getProject,
  updateProject,
  countCriticalPath,
  countProjectDates
};