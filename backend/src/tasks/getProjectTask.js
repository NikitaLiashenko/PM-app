"use strict";
const userHelper = require('./helpers/userHelper');
const dynamoHelper = require('./helpers/dynamoHelper');

module.exports.handler = async(event) => {
  const projectId = event.pathParameters.projectId;
  const taskId = event.pathParameters.taskId;
  const username = userHelper.getUserData(event);

  try {
    const result = await dynamoHelper.getProject(projectId, username);

    if(!result){
      return {
        statusCode : 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body : JSON.stringify({
          message : 'No project found'
        })
      }
    }

    const task = result.tasks.find(task => task.taskId === taskId);

    if(!task){
      return {
        statusCode : 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body : JSON.stringify({
          message : 'No task found'
        })
      }
    }

    return {
      statusCode : 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body : JSON.stringify(task)
    };
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
};