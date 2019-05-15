"use strict";
const userHelper = require('./helpers/userHelper');
const dynamoHelper = require('./helpers/dynamoHelper');
const utils = require('./helpers/utils');
const _ = require('lodash');
const momentBusinessDays = require('moment-business-days');

module.exports.handler = async(event) => {
  const projectId = event.pathParameters.projectId;
  const crashId = event.pathParameters.crashId;
  const username = userHelper.getUserData(event);

  let project;
  try {
    project = await dynamoHelper.getProject(projectId, username);
  } catch (dynamoError) {
    console.error(dynamoError);

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        message: dynamoError.message
      })
    };
  }

  if (!project) {
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        message: 'No project found'
      })
    }
  }

  if (!project.crash || !project.crash.length) {
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        message: 'No project crash found'
      })
    }
  }

  const crash = project.crash.find(crash => crash.crashId === crashId);

  if(!crash){
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        message: 'No such project crash found'
      })
    }
  }

  _.omit(project, ['projectId', 'crash', 'username']);

  project.tasks.forEach(task => {
    task.estimateMax = crash[task.taskId].estimateMax;
  });

  const tasksWithDirectCount = utils.countDirect(project.tasks, project.graph);

  const projectDuration = utils.countProjectDuration(tasksWithDirectCount);

  const tasksBackward = utils.countBackward(tasksWithDirectCount, project.graph);

  const tasksWithCriticalPath = utils.countCriticalPath(tasksBackward);

  const tasksFloats = utils.countFloats(tasksWithCriticalPath);

  const tasksFreeFloat = utils.countFreeFloat(tasksFloats, project.graph);

  project.tasks = tasksFreeFloat;
  project.projectCost = crash.projectCost;
  project.projectDuration = projectDuration;

  console.log('Preparing project dates');

  let workers;

  try {
    workers = await dynamoHelper.getAllWorkers(projectId);
  } catch(dynamoError){
    console.error(dynamoError);
    return {
      statusCode : 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body : JSON.stringify({
        message : dynamoError.message
      })
    }
  }

  workers = workers.filter(worker => {
    if(worker.project) {
      return worker.project.projectId === projectId
    } else {
      return false;
    }
  });

  const locations = _.uniq(workers.map(worker => worker.location));

  console.log(locations);

  const locationsRetrievalPromises = [];

  locations.forEach(location => {
    locationsRetrievalPromises.push(dynamoHelper.getCalendar(location));
  });

  let calendars;
  try {
    calendars = await Promise.all(locationsRetrievalPromises);
  } catch(dynamoError){
    console.error(dynamoError);

    return {
      statusCode : 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body : JSON.stringify({
        message: dynamoError.message
      })
    };
  }

  const holidays = calendars.map(location => location.holidays);

  const unique = _.uniqBy(_.flattenDeep(holidays), 'date');

  momentBusinessDays.updateLocale('en', {
    holidays: unique,
    holidayFormat: 'YYYY-MM-DD'
  });

  project.tasks.forEach(task => {
    task.startDate = momentBusinessDays(project.startDate, 'YYYY-MM-DD')
      .businessAdd(task.earlyStart)
      .format('YYYY-MM-DD');
    task.endDate = momentBusinessDays(project.startDate, 'YYYY-MM-DD')
      .businessAdd(task.earlyFinish)
      .format('YYYY-MM-DD');
  });

  project.endDate = momentBusinessDays(project.startDate, 'YYYY-MM-DD')
    .businessAdd(project.projectDuration)
    .format('YYYY-MM-DD');


  return {
    statusCode : 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body : JSON.stringify(project)
  }
};