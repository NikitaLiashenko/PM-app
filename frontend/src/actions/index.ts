import login from './login';
import register from './register';

import projectActions from './projectActions';

export default {
  login,
  register,
  ...projectActions
}