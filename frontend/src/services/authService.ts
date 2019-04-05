import {authClient} from '@/api/clients/clients';

export type TokenRole = {
  token : string;
  role : string;
};

const authorize = async (email : string, password : string)
  : Promise<TokenRole> => {
  const body = {
    email,
    password
  };

  const response = await authClient.post('/signin', body);

  return response.data;
};

const register = async (email : string, password : string)
  : Promise<any> => {
  const body = {
    email,
    password
  };

  const response = await authClient.post('/signup', body);

  return response.data;
};

export default {
  authorize,
  register
}