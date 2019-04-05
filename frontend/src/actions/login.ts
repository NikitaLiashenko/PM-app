import stores from '@/stores'

export default ({
  email,
  password
} : {
  email : string,
  password : string
}) => {
  return stores.authStore.authorize(email, password);
}