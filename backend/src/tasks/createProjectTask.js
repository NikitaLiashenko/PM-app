"use strict";
const userHelper = require('./helpers/userHelper');
const dynamoHelper = require('./helpers/dynamoHelper');
const utils = require('./helpers/utils');
const uuid = require('uuid/v4');
const AJV = require('ajv');
const createTaskSchema = require('./schema/createTask');
const ajv = new AJV({schemas : [createTaskSchema]});
const _ = require('lodash');

module.exports.handler = async(event) => {
  const projectId = event.pathParameters.projectId;
  const body = JSON.parse(event.body);
  const username = userHelper.getUserData(event);

  const isValid = ajv.validate('createTask', body);

  let response;

  if(!isValid){
    console.error('The body received has invalid structure');
    console.error(ajv.errors);
    response = {
      statusCode : 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
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

  const task = Object.assign(
    {},
    {
      taskId : uuid()
    },
    body
  );

  if(project.tasks){
    project.tasks.push(task);
  } else {
    project.tasks = [task];
  }

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
      body: JSON.stringify({
        taskId : task.taskId
      })
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