import login from './login';
import register from './register';
import logout from './logout';

import projectActions from './projectActions';
import tasksActions from './tasksActions';
import teamActions from './teamActions';
import risksActions from './risksActions';
import calendarActions from './calendarActions';
import crashActions from './crashActions';

export default {
  login,
  register,
  logout,
  ...projectActions,
  ...tasksActions,
  ...teamActions,
  ...risksActions,
  ...calendarActions,
  ...crashActions
}