import {action ,observable, runInAction} from "mobx";
import ProjectService, {Project} from '@/services/projectService';
import TaskService, {Task} from '@/services/taskService';

class ManagerStore {
  @observable
  projectsList : Array<Project> = [];

  @observable
  project : Project = {};

  @observable
  tasks : Array<Task> = [];

  @observable
  task : Task = {};

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
  cleanTasks = () => {
    this.tasks = [];
  };

  @action
  cleanTask = () => {
    this.task = {};
  };
}

export default ManagerStore;