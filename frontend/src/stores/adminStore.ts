import {action, observable, runInAction} from "mobx";
import WorkerService, {Worker} from "@/services/workerService";
import CalendarService, {Calendar} from "@/services/calendarService";
import ProjectService, {Project} from "@/services/projectService";

class AdminStore {
  @observable
  workers : Array<Worker> = [];

  @observable
  worker : Worker = {};

  @observable
  calendars : Array<Calendar> = [];

  @observable
  calendar : Calendar = { holidays : []};

  @observable
  projects : Array<Project> = [];

  @action
  getAllWorkers = async() => {
    let response : any;

    try {
      response = await WorkerService.getAllWorkers();
    } catch(responseError){
      return Promise.reject(responseError.response);
    }

    runInAction(() => {
      this.workers = response;
    });

    return Promise.resolve();
  };

  @action
  getWorker = async(workerId : string) => {
    let response : any;

    try {
      response = await WorkerService.getWorker(workerId);
    } catch(responseError){
      return Promise.reject(responseError.response);
    }

    runInAction(() => {
      this.worker = response;
    });

    return Promise.resolve();
  };

  @action
  createWorker = async(worker : Worker) => {
    let response : any;

    try {
      response = await WorkerService.createWorker(worker);
    } catch(responseError){
      return Promise.reject(responseError.response);
    }

    return Promise.resolve();
  };

  @action
  updateWorker = async(workerId : string, worker : Worker) => {
    let response : any;

    try {
      response = await WorkerService.updateWorker(workerId, worker);
    } catch(responseError){
      return Promise.reject(responseError.response);
    }

    runInAction(() => {
      this.worker = response;
    });

    return Promise.resolve();
  };

  @action
  deleteWorker = async(workerId : string) => {
    let response : any;

    try {
      response = await WorkerService.deleteWorker(workerId);
    } catch(responseError){
      return Promise.reject(responseError.response);
    }

    runInAction(() => {
      this.worker = {};
    });

    return Promise.resolve();
  };

  @action
  cleanWorkers = () => {
    this.workers = [];
  };

  @action
  cleanWorker = () => {
    this.worker = {};
  };

  @action
  getAllCalendars = async() => {
    let response : any;

    try {
      response = await CalendarService.getAllCalendars();
    } catch(responseError){
      return Promise.reject(responseError.response);
    }

    runInAction(() => {
      this.calendars = response;
    });

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
  cleanCalendars = () => {
    this.calendars = [];
  };

  @action
  cleanCalendar = () => {
    this.calendar = { holidays : []};
  };

  @action
  getAllProjects = async() => {
    let response : any;

    try {
      response = await ProjectService.getAllProject();
    } catch(responseError){
      return Promise.reject(responseError.response);
    }

    runInAction(() => {
      this.projects = response;
    });

    return Promise.resolve();
  };

  @action
  cleanProjects = () => {
    this.projects = [];
  };
}

export default AdminStore;