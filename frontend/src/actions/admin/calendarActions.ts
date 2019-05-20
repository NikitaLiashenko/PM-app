import stores from '@/stores';
import {Calendar} from '@/services/calendarService';

const getAllCalendars = () => {
  return stores.adminStore.getAllCalendars();
};

const updateLocationCalendar = (location : string, calendar : Calendar) => {
  return stores.adminStore.updateLocationCalendar(location, calendar);
};

const cleanCalendars = () => {
  return stores.adminStore.cleanCalendars()
};

const cleanCalendar = () => {
  return stores.adminStore.cleanCalendar();
};

export default {
  getAllCalendars,
  updateLocationCalendar,
  cleanCalendar,
  cleanCalendars
};