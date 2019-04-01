"use strict";
const userHelper = require('./helpers/userHelper');
const dynamoHelper = require('./helpers/dynamoHelper');
const utils = require('./helpers/utils');
const _ = require('lodash');

module.exports.handler = async(event) => {
  const projectId = event.pathParameters.projectId;
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

  if (!project.tasks || !project.tasks.length) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: 'No project tasks found'
      })
    }
  }

  if(!project.overheadCostPerDay){
    return {
      status : 400,
      body : JSON.stringify({
        message : 'Project overhead cost per day should be specified'
      })
    };
  }

  let tasks, graph;
  if(!project.graph){
    ({tasks, graph} = utils.prepareGraphAndOrder(project.tasks))
  } else {
    tasks = project.tasks;
    graph = project.graph;
  }

  const crashResult = utils.countCrash(tasks, graph, project.overheadCostPerDay);

  project = _.omit(project, ['projectId']);
  project.crash = crashResult;

  const {updateString, expressionAttributeValues, expressionAttributeNames} = utils.prepareUpdateStringAndObject(project);

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