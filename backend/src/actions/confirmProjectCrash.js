"use strict";
const userHelper = require('./helpers/userHelper');
const dynamoHelper = require('./helpers/dynamoHelper');
const utils = require('./helpers/utils');
const _ = require('lodash');

module.exports.handler = async (event) => {
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

  const projectCopy = _.cloneDeep(project);

  project = _.omit(project, ['graph', 'username', 'projectId', 'crash', 'risks', 'history']);

  projectCopy.tasks.forEach(task => {
    task.estimateMax = crash[task.taskId].estimateMax;
  });

  const tasksWithDirectCount = utils.countDirect(projectCopy.tasks, projectCopy.graph);

  const projectDuration = utils.countProjectDuration(tasksWithDirectCount);

  const tasksBackward = utils.countBackward(tasksWithDirectCount, projectCopy.graph);

  const tasksWithCriticalPath = utils.countCriticalPath(tasksBackward);

  const tasksFloats = utils.countFloats(tasksWithCriticalPath);

  const tasksFreeFloat = utils.countFreeFloat(tasksFloats, projectCopy.graph);

  projectCopy.tasks = tasksFreeFloat;
  projectCopy.projectCost = crash.projectCost;
  projectCopy.projectDuration = projectDuration;

  if(!projectCopy.history){
    projectCopy.history = [project];
  } else {
    projectCopy.history.push(project);
  }
  console.log(projectCopy);
  const {updateString, expressionAttributeValues, expressionAttributeNames} = utils.prepareUpdateStringAndObject(_.omit(projectCopy, ['projectId']));

  try {
    const updatedObject = await dynamoHelper.updateProject({
      UpdateExpression: updateString,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: expressionAttributeNames,
      Key: {
        projectId
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify(_.omit(updatedObject, ['username', 'graph']))
    };
  } catch (dynamoError) {
    console.error(dynamoError.message);

    return {
      statusCode: 500,
      body: JSON.stringify(
        {
          message: dynamoError.message
        }
      )
    }
  }
};