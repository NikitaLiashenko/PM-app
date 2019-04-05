import axios, { AxiosInstance } from 'axios';

interface Config {
  baseUrl: string;
  headers: {
    [key: string]: string,
  };
}

export default (config: Config): AxiosInstance => {
  return axios.create({
    baseURL: config.baseUrl,
    headers: config.headers,
  });
};
