import AuthStore from '@/stores/authStore';
import ManagerStore from '@/stores/managerStore';

export {
  AuthStore,
  ManagerStore
};

const authStore = new AuthStore();
const managerStore = new ManagerStore();

export default {
  authStore,
  managerStore
};