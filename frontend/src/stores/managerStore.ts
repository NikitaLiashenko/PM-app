import {action ,observable, runInAction} from "mobx";
import ProjectService, {Project} from '@/services/projectService';
import TaskService, {Task} from '@/services/taskService';
import WorkerService, {Worker} from '@/services/workerService';
import RiskService, {Risk} from '@/services/riskService';
import CalendarService, {Calendar} from '@/services/calendarService';
import CrashService, {Crash} from "@/services/crashService";

class ManagerStore {
  @observable
  projectsList : Array<Project> = [];

  @observable
  project : Project = {};

  @observable
  tasks : Array<Task> = [];

  @observable
  task : Task = {};

  @observable
  projectTeam : Array<Worker> = [];

  @observable
  team : Array<Worker> = [];

  @observable
  risks : Array<Risk> = [];

  @observable
  risk : Risk = {};

  @observable
  calendars : Array<Calendar> = [];

  @observable
  calendar : Calendar = { holidays : []};

  @observable
  projectCrash : Array<Crash> = [];

  @observable
  projectStateInCrash : Project = {};

  @action
  getAllUserProjects = async() => {

    let response : any;
    try {
      response = await ProjectService.getAllProject();
    } catch(responseError){
      return Promise.reject(responseError.response);
    }

    runInAction(() => {
      this.projectsList = response;
    });

    return Promise.resolve();
  };

  @action
  createNewProject = async(project : Project) => {
    let response : any;

    try{
      response = await ProjectService.createProject(project);
    } catch(responseError){
      return Promise.reject(responseError.message);
    }

    runInAction(() => {
      this.projectsList.push(response.project);
    });

    return Promise.resolve(response.message);
  };

  @action
  getProject = async(projectId : string) => {
    let response : any;

    try {
      response = await ProjectService.getProject(projectId);
    } catch(responseError){
      return Promise.reject(responseError.message);
    }

    runInAction(() => {
      this.project = response;
    });

    return Promise.resolve();
  };

  @action
  updateProject = async(project : Project, projectId : string) => {
    let response : any;

    try {
      response = await ProjectService.updateProject(project, projectId);
    } catch(responseError){
      return Promise.reject(responseError.message);
    }


    runInAction(() => {
      this.project = response;
    });

    return Promise.resolve();

  };

  @action
  cleanProjectsList = () => {
    this.projectsList = [];
  };

  @action
  cleanProject = () => {
    this.project = {};
    this.tasks = [];
    this.projectTeam = [];
  };

  @action
  getAllProjectTasks = async (projectId : string) => {
    let response : any;

    try {
      response = await TaskService.getAllProjectTasks(projectId);
    } catch(responseError){
      return Promise.reject(responseError.message);
    }

    runInAction(() => {
      this.tasks = response;
    });

    return Promise.resolve();

  };

  @action
  getProjectTask = async (projectId : string, taskId : string) => {
    let response : any;

    try {
      response = await TaskService.getProjectTask(projectId, taskId);
    } catch(responseError){
      return Promise.reject(responseError.message);
    }

    runInAction(() => {
      this.task = response;
    });

    return Promise.resolve();
  };

  @action
  createTask = async (task : Task) => {
    let response : any;

    try {
      response = await TaskService.createProjectTask(this.project.projectId as string, task);
    } catch(responseError){
      return Promise.reject(responseError.message);
    }

    return Promise.resolve(response);
  };

  @action
  updateTask = async (taskId : string, task : Task) => {
    let response : any;

    try {
      response = await TaskService.updateProjectTask(this.project.projectId as string, taskId, task);
    } catch(responseError){
      return Promise.reject(responseError.message);
    }

    return Promise.resolve();
  };

  @action
  deleteTask = async () => {
    let response : any;

    try{
      response = await TaskService.deleteProjectTask(this.project.projectId as string, this.task.taskId as string);
    } catch(responseError){
      return Promise.reject(responseError.message);
    }

    runInAction(() => {
      this.task = {};
    });

    return Promise.resolve();
  };

  @action
  cleanTasks = () => {
    this.tasks = [];
  };

  @action
  cleanTask = () => {
    this.task = {};
  };

  @action
  getProjectTeam = async() => {
    let response : any;

    try{
      response = await WorkerService.getProjectTeam(this.project.projectId as string);
    } catch(responseError){
      return Promise.reject(responseError.message);
    }

    runInAction(() => {
      this.projectTeam = response;
    });

    return Promise.resolve();
  };

  @action
  prepareProjectTeam = async (teamParams : any) => {
    let response : any;

    try {
      response = await WorkerService.prepareProjectTeam(teamParams, this.project.projectId as string);
    } catch(responseError){
      return Promise.reject(responseError.message);
    }

    runInAction(() => {
      this.projectTeam = response;
    });

    return Promise.resolve();
  };

  @action
  cleanProjectTeam = () => {
    this.projectTeam = [];
  };

  @action
  countCriticalPath = async() => {
    let response : any;

    try{
      response = await ProjectService.countCriticalPath(this.project.projectId as string);
    } catch(responseError){
      return Promise.reject(responseError.message);
    }

    return Promise.resolve();
  };

  @action
  countProjectDates = async() => {
    let response : any;

    const locations : Array<string> = [];

    this.projectTeam.forEach(worker => {
      if(!locations.includes(worker.location as string)){
        locations.push(worker.location as string);
      }
    });

    try{
      response = await ProjectService.countProjectDates(this.project.projectId as string, locations);
    } catch(responseError){
      return Promise.reject(responseError.message);
    }

    return Promise.resolve();
  };

  @action
  getAllProjectRisks = async(projectId : string) => {
    let response : any;

    try {
      response = await RiskService.getAllProjectRisks(projectId);
    } catch( responseError){
      return Promise.reject(responseError.message);
    }

    runInAction(() => {
      this.risks = response;
    });

    return Promise.resolve();
  };

  @action
  getProjectRisk = async(projectId : string, riskId : string) => {
    let response : any;

    try {
      response = await RiskService.getProjectRisk(projectId, riskId);
    } catch(responseError){
      return Promise.reject(responseError.message);
    }

    runInAction(() => {
      this.risk = response;
    });


    return Promise.resolve();
  };

  @action
  createRisk = async(risk : Risk) => {
    let response : any;

    try {
      response = await RiskService.createProjectRisk(this.project.projectId as string, risk)
    } catch(responseError){
      return Promise.reject(responseError.message);
    }

    return Promise.resolve(response);
  };

  @action
  updateRisk = async(riskId : string, risk : Risk) => {
    let response : any;

    try {
      response = await RiskService.updateProjectRisk(this.project.projectId as string, riskId, risk);
    } catch(responseError){
      return Promise.reject(responseError.message);
    }

    return Promise.resolve();
  };

  @action
  deleteRisk = async() => {
    let response : any;

    try {
      response = await RiskService.deleteProjectRisk(this.project.projectId as string, this.risk.riskId as string);
    } catch(responseError){
      return Promise.reject(responseError.message);
    }

    return Promise.resolve();
  };

  @action
  cleanRisks = () => {
    this.risks = [];
  };

  @action
  cleanRisk = () => {
    this.risk = {};
  };

  @action
  getAllCalendars = async() => {
    let response : any;

    try {
      response = await CalendarService.getAllCalendars();
    } catch(responseError){
      return Promise.reject(responseError.message);
    }

    runInAction(() => {
      this.calendars = response;
    });


    return Promise.resolve();
  };

  @action
  getLocationCalendar = async(location : string) => {
    let response : any;

    try {
      response = await CalendarService.getLocationCalendar(location);
    } catch(responseError){
      return Promise.reject(responseError.message);
    }

    runInAction(() => {
      this.calendar = response;
    });

    return Promise.resolve();
  };

  @action
  createLocationCalendar = async(location : string, calendar : Calendar) => {
    let response : any;

    try {
      response = await CalendarService.createLocationCalendar(location, calendar);
    } catch (responseError) {
      return Promise.reject(responseError.message);
    }

    return Promise.resolve();
  };

  @action
  updateLocationCalendar = async(location : string, calendar : Calendar) => {
    let response : any;

    try {
      response = await CalendarService.updateLocationCalendar(location, calendar);
    } catch (responseError){
      return Promise.reject(responseError.message);
    }

    return Promise.resolve();
  };

  @action
  getUniqueHolidaysBetweenCalendars = async(locations : Array<string>) => {
    let response : any;

    try {
      response = await CalendarService.getUniqueHolidaysBetweenCalendars(locations);
    } catch(responseError){
      return Promise.reject(responseError.message);
    }

    runInAction(() => {
      this.calendar = response;
    });

    return Promise.resolve();
  };

  @action
  cleanCalendars = () => {
    this.calendars = [];
  };

  @action
  cleanCalendar = () => {
    this.calendar = {holidays : []};
  };

  @action
  getAllWorkers = async() => {
    let response : any;

    try {
      response = await WorkerService.getAllWorkers();
    } catch(responseError){
      return Promise.reject(responseError.message);
    }

    runInAction(() => {
      this.team = response;
    });


    return Promise.resolve();
  };

  @action
  cleanWorkers = () => {
    this.team = [];
  };

  @action
  getProjectCrash = async(projectId : string) => {
    let response : any;

    try {
      response = await CrashService.getProjectCrash(projectId);
    } catch(responseError) {
      return Promise.reject(responseError.message);
    }

    runInAction(() => {
      this.projectCrash = response;
    });

    return Promise.resolve();
  };

  @action
  getProjectStateInCrash = async(projectId : string, crashId : string) => {
    let response : any;

    try {
      response = await CrashService.getProjectStateInCrash(projectId, crashId);
    } catch(responseError){
      return Promise.reject(responseError.message);
    }

    runInAction(() => {
      this.projectStateInCrash = response;
    });

    return Promise.resolve();
  };

  @action
  confirmProjectCrash = async(projectId : string, crashId : string) => {
    let response : any;

    try {
      response = await CrashService.confirmProjectCrash(projectId, crashId);
    } catch(responseError){
      return Promise.reject(responseError.message);
    }

    return Promise.resolve();
  };

  @action
  cleanProjectCrash = () => {
    this.projectCrash = [];
  };

  @action
  cleanProjectStateInCrash = () => {
    this.projectStateInCrash = {};
  };
}

export default ManagerStore;