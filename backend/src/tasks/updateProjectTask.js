"use strict";
const userHelper = require('./helpers/userHelper');
const dynamoHelper = require('./helpers/dynamoHelper');
const utils = require('./helpers/utils');
const AJV = require('ajv');
const updateTaskSchema = require('./schema/updateTask');
const ajv = new AJV({schemas : [updateTaskSchema]});
const _ = require('lodash');

module.exports.handler = async(event) => {
  const projectId = event.pathParameters.projectId;
  const taskId = event.pathParameters.taskId;
  const body = JSON.parse(event.body);
  const username = userHelper.getUserData(event);

  const isValid = ajv.validate('updateTask', body);

  let response;

  if(!isValid){
    console.error('The body received has invalid structure');
    console.error(ajv.errors);
    response = {
      statusCode : 400,
      body : JSON.stringify({
        message : 'The body received has invalid structure'
      })
    };

    return response;
  }

  let project;
  try {
    project = await dynamoHelper.getProject(projectId, username);

    if(!project) {
      return {
        statusCode : 404,
        body : JSON.stringify({
          message : 'No such project found'
        })
      }
    }

  } catch(dynamoError){
    console.error(dynamoError);

    return {
      statusCode : 500,
      body : dynamoError.message
    };
  }

  project = _.omit(project, ['projectId']);

  if(!project.tasks){
    return {
      statusCode : 404,
      body : JSON.stringify({
        message : 'No tasks for this project found'
      })
    };
  }

  const taskIndex = project.tasks.findIndex(task => task.taskId === taskId);

  if(taskIndex < 0){
    return {
      statusCode : 404,
      body : JSON.stringify({
        message : 'No such task found for this project'
      })
    };
  }

  project.tasks[taskIndex] = Object.assign({}, project.tasks[taskIndex], body);

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
      body: JSON.stringify(_.omit(updatedObject, ['username']))
    };
  } catch (dynamoError) {
    console.error(dynamoError.message);

    response = {
      statusCode: 500,
      body: JSON.stringify(
        {
          message: dynamoError.message
        }
      )
    }
  }

  return response;
};