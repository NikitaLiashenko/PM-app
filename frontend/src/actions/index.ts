import login from './login';
import register from './register';

import projectActions from './projectActions';
import tasksActions from './tasksActions';
import teamActions from './teamActions';

export default {
  login,
  register,
  ...projectActions,
  ...tasksActions,
  ...teamActions
}