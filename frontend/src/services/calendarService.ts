import {apiClient} from '@/api/clients/clients';

export type Calendar = {
  location? : string,
  holidays : Array<Holiday>
};

export type Holiday = {
  date : string,
  description : string
};

const getAllCalendars = async() : Promise<Array<Calendar>> => {
  const response = await apiClient.get(`/calendar`);

  return response.data;
};

const getLocationCalendar = async(location : string) : Promise<Calendar> => {
  const response = await apiClient.get(`/calendar/${location}`);

  return response.data;
};

const createLocationCalendar = async(location : string, calendar : Calendar) : Promise<object> => {
  const response = await apiClient.post(`/calendar/${location}`, calendar);

  return response.data;
};

const updateLocationCalendar = async(location : string, calendar : Calendar) : Promise<object> => {
  const response = await apiClient.put(`/calendar/${location}`, calendar);

  return response.data;
};

const getUniqueHolidaysBetweenCalendars = async(locations : Array<string>) : Promise<Calendar> => {
  const response = await apiClient.get(`/calendar/unique`, { params : { locations }});

  return response.data;
};

export default {
  getAllCalendars,
  getLocationCalendar,
  createLocationCalendar,
  updateLocationCalendar,
  getUniqueHolidaysBetweenCalendars
};