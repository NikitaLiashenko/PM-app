import {action ,observable, runInAction} from "mobx";
import ProjectService, {Project} from '@/services/projectService';
import TaskService, {Task} from '@/services/taskService';
import WorkerService, {Worker} from '@/services/workerService';

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
  team : Array<Worker> = [];

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
    this.team = [];
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
  updateTask = async (task : Task) => {
    let response : any;

    try {
      response = await TaskService.updateProjectTask(this.project.projectId as string, this.task.taskId as string, task);
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
      this.team = response;
    });

    return Promise.resolve();
  };

  @action
  cleanProjectTeam = () => {
    this.team = [];
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

    this.team.forEach(worker => {
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
}

export default ManagerStore;