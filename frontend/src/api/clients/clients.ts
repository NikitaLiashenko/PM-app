import {AxiosError, AxiosRequestConfig, AxiosResponse} from "axios";
import createClient from './clientFactory';
import storage, {TOKEN} from "@/stores/storage";
console.log(process.env);
const baseAPIUrl = process.env.REACT_APP_BASE_API_URL || '';

const authClient = createClient({
  baseUrl : baseAPIUrl,
  headers: {
    'Content-Type': 'application/json',
  }
});

const apiClient = createClient({
  baseUrl : baseAPIUrl,
  headers: {
    'Content-Type': 'application/json',
  }
});

const interceptorsReq = (config: AxiosRequestConfig) => {
  return {
    ...config,
    headers: {
      ...config.headers,
    },
  };
};

const apiClientInterceptorsReq = (config: AxiosRequestConfig) => {
  return {
    ...config,
    headers: {
      ...config.headers,
      Authorization: `${storage.get(TOKEN)}`,
    },
  };
};

const interceptorsReqError = (error: any) => {
  return Promise.reject(error);
};

const interceptorsRes = (response: AxiosResponse) => {
  return response;
};

const interceptorsResError = (error: AxiosError) => {
  if (!error.response) { return Promise.reject('Empty error response'); }

  return Promise.reject(error);
};

authClient.interceptors.request.use(interceptorsReq, interceptorsReqError);
authClient.interceptors.response.use(interceptorsRes, interceptorsResError);

apiClient.interceptors.request.use(apiClientInterceptorsReq, interceptorsReqError);
apiClient.interceptors.response.use(interceptorsRes, interceptorsResError);

export {
  authClient,
  apiClient
}