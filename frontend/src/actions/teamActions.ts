import stores from '@/stores';

const getProjectTeam = () => {
  return stores.managerStore.getProjectTeam();
};

export default {
  getProjectTeam
};