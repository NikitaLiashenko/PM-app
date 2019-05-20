import login from './login';
import register from './register';
import logout from './logout';

import managerProjectActions from './manager/projectActions';
import managerTasksActions from './manager/tasksActions';
import managerTeamActions from './manager/teamActions';
import managerRisksActions from './manager/risksActions';
import managerCalendarActions from './manager/calendarActions';
import managerCrashActions from './manager/crashActions';

import adminTeamActions from './admin/teamActions';
import adminCalendarActions from './admin/calendarActions';
import adminProjectActions from './admin/projectActions';

export default {
  login,
  register,
  logout,
  manager : {
    ...managerProjectActions,
    ...managerTasksActions,
    ...managerTeamActions,
    ...managerRisksActions,
    ...managerCalendarActions,
    ...managerCrashActions
  },
  admin : {
    ...adminTeamActions,
    ...adminCalendarActions,
    ...adminProjectActions
  }
}