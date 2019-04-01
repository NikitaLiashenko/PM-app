"use strict";
const userHelper = require('./helpers/userHelper');
const dynamoHelper = require('./helpers/dynamoHelper');
const utils = require('./helpers/utils');
const _ = require('lodash');

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
      body: JSON.stringify({
        message: dynamoError.message
      })
    };
  }

  if (!project) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: 'No project found'
      })
    }
  }

  if (!project.crash || !project.crash.length) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: 'No project crash found'
      })
    }
  }

  const crash = project.crash.find(crash => crash.crashId === crashId);

  if(!crash){
    return {
      statusCode: 404,
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

  return {
    statusCode : 200,
    body : JSON.stringify(project)
  }
};