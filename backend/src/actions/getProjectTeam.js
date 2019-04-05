"use strict";
const dynamoHelper = require('./helpers/dynamoHelper');
const userHelper = require('./helpers/userHelper');

module.exports.handler = async(event) => {
  const projectId = event.pathParameters.projectId;
  const username = await userHelper.getUserData(event);

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
  return {
    statusCode : 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body : JSON.stringify(workers)
  }
};