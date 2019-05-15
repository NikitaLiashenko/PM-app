import stores from '@/stores';

export default () => {
  return stores.authStore.logout();
}