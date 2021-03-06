"use strict";
const dynamoHelper = require('./helpers/dynamoHelper');
const userHelper = require('./helpers/userHelper');
const utils = require('./helpers/utils');

module.exports.handler = async(event) => {
  const body = JSON.parse(event.body);
  const projectId = event.pathParameters.projectId;
  const username = await userHelper.getUserData(event);

  let project;
  console.log('Project');
  try {
    project = await dynamoHelper.getProject(projectId, username);
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
    };
  }

  if(!project){
    console.log('No such project found');
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

  const workersToUpdate = [];

  body.forEach(worker => {
    workersToUpdate.push(worker.username);
  });

  const workersUpdatePromises = [];
  workersToUpdate.forEach(workerId => {
    const {updateString, expressionAttributeValues, expressionAttributeNames} = utils.prepareWorkerProjectAssignParams(projectId, project.endDate);
    workersUpdatePromises.push(dynamoHelper.updateWorker({
      UpdateExpression : updateString,
      ExpressionAttributeNames : expressionAttributeNames,
      ExpressionAttributeValues : expressionAttributeValues,
      Key : {
        username : workerId
      }
    }))
  });
  console.log('Workers');
  try{
    await Promise.all(workersUpdatePromises);

    return {
      statusCode : 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body : JSON.stringify({
        message : 'Team successfully assigned to the project'
      })
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
        message : dynamoError.message
      })
    }
  }
};