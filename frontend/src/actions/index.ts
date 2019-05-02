import login from './login';
import register from './register';

import projectActions from './projectActions';
import tasksActions from './tasksActions';
import teamActions from './teamActions';
import risksActions from './risksActions';
import calendarActions from './calendarActions';

export default {
  login,
  register,
  ...projectActions,
  ...tasksActions,
  ...teamActions,
  ...risksActions,
  ...calendarActions
}