import {action ,observable, runInAction} from "mobx";
import ProjectService, {Project} from '@/services/projectService';

class ManagerStore {
  @observable
  projectsList : Array<Project> = [];

  @observable
  project : object | Project = {};

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
}

export default ManagerStore;