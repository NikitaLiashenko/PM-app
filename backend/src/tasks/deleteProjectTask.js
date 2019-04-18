"use strict";
const userHelper = require('./helpers/userHelper');
const dynamoHelper = require('./helpers/dynamoHelper');
const utils = require('./helpers/utils');
const _ = require('lodash');

module.exports.handler = async(event) => {
  const projectId = event.pathParameters.projectId;
  const taskId = event.pathParameters.taskId;
  const username = userHelper.getUserData(event);

  let response;

  let project;
  try {
    project = await dynamoHelper.getProject(projectId, username);

    if(!project) {
      return {
        statusCode : 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body : JSON.stringify({
          message : 'No such project found'
        })
      }
    }

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

  project = _.omit(project, ['projectId']);

  if(!project.tasks){
    return {
      statusCode : 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body : JSON.stringify({
        message : 'No tasks for this project found'
      })
    };
  }

  const taskIndex = project.tasks.findIndex(task => task.taskId === taskId);

  if(taskIndex < 0){
    return {
      statusCode : 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body : JSON.stringify({
        message : 'No such task found for this project'
      })
    };
  }

  const predecessors = project.tasks[taskIndex].predecessor;

  project.tasks.forEach(task => {
    if(task.predecessor.includes(taskId)){
      const predecessorIndex = task.predecessor.findIndex(predecessor => predecessor === taskId);

      task.predecessor.splice(predecessorIndex, 1);

      task.predecessor = task.predecessor.concat(predecessors);
    }
  });

  project.tasks.splice(taskIndex, 1);

  const {updateString, expressionAttributeValues} = utils.prepareUpdateStringAndObject(project);

  try {
    const updatedObject = await dynamoHelper.updateProject({
      UpdateExpression: updateString,
      ExpressionAttributeValues: expressionAttributeValues,
      Key: {
        projectId
      }
    });

    response = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(_.omit(updatedObject, ['username']))
    };
  } catch (dynamoError) {
    console.error(dynamoError.message);

    response = {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(
        {
          message: dynamoError.message
        }
      )
    }
  }

  return response;
};