import stores from '@/stores';
import {Calendar} from '@/services/calendarService';

const getAllCalendars = () => {
  return stores.managerStore.getAllCalendars();
};

const getLocationCalendar = (location : string) => {
  return stores.managerStore.getLocationCalendar(location);
};

const createLocationCalendar = (location : string, calendar : Calendar) => {
  return stores.managerStore.createLocationCalendar(location, calendar);
};

const updateLocationCalendar = (location : string, calendar : Calendar) => {
  return stores.managerStore.updateLocationCalendar(location, calendar);
};

const getUniqueHolidaysBetweenCalendars = (locations : Array<string> ) => {
  return stores.managerStore.getUniqueHolidaysBetweenCalendars(locations);
};

const cleanCalendars = () => {
  return stores.managerStore.cleanCalendars();
};

const cleanCalendar = () => {
  return stores.managerStore.cleanCalendar();
};

export default {
  getAllCalendars,
  getLocationCalendar,
  createLocationCalendar,
  updateLocationCalendar,
  getUniqueHolidaysBetweenCalendars,
  cleanCalendar,
  cleanCalendars
};