import AuthStore from '@/stores/authStore';
import ManagerStore from '@/stores/managerStore';
import AdminStore from '@/stores/adminStore';

export {
  AuthStore,
  ManagerStore,
  AdminStore
};

const authStore = new AuthStore();
const managerStore = new ManagerStore();
const adminStore = new AdminStore();

export default {
  authStore,
  managerStore,
  adminStore
};