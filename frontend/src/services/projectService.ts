import {authClient, apiClient} from '@/api/clients/clients';

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

export default {
  getAllProject,
  createProject
};