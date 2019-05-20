import stores from '@/stores';
import workerService, {Worker} from '@/services/workerService';

const getProjectTeam = () => {
  return stores.managerStore.getProjectTeam();
};

const cleanProjectTeam = () => {
  return stores.managerStore.cleanProjectTeam();
};

const prepareProjectTeam = (teamParams : any) => {
  return stores.managerStore.prepareProjectTeam(teamParams);
};

const getAllWorkers = () => {
  return stores.managerStore.getAllWorkers();
};

const cleanWorkers = () => {
  return stores.managerStore.cleanWorkers();
};

const confirmProjectTeam = (team : Array<Worker>, projectId : string) => {
  return workerService.confirmProjectTeam(team, projectId);
};


export default {
  getProjectTeam,
  cleanProjectTeam,
  getAllWorkers,
  cleanWorkers,
  prepareProjectTeam,
  confirmProjectTeam
};