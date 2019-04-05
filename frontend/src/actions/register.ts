import authService from '@/services/authService';

export default ({
  email,
  password
} : {
  email : string,
  password : string
}) => {
  return authService.register(email, password);
};