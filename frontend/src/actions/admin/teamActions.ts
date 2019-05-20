import stores from '@/stores';
import workerService, {Worker} from "@/services/workerService";

const getAllWorkers = () => {
  return stores.adminStore.getAllWorkers();
};

const getWorker = (workerId : string) => {
  return stores.adminStore.getWorker(workerId);
};

const createWorker = (worker : Worker) => {
  return stores.adminStore.createWorker(worker);
};

const updateWorker = (workerId : string, worker : Worker) => {
  return stores.adminStore.updateWorker(workerId, worker);
};

const deleteWorker = (workerId : string) => {
  return stores.adminStore.deleteWorker(workerId);
};

const cleanWorkers = () => {
  return stores.adminStore.cleanWorkers();
};

const cleanWorker = () => {
  return stores.adminStore.cleanWorker();
};

export default {
  getAllWorkers,
  getWorker,
  createWorker,
  updateWorker,
  deleteWorker,
  cleanWorkers,
  cleanWorker
};