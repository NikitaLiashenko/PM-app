"use strict";
const dynamoHelper = require('./helpers/dynamoHelper');
const userHelper = require('./helpers/userHelper');
const utils = require('./helpers/utils');

module.exports.handler = async(event) => {
  const body = JSON.parse(event.body);
  const projectId = event.pathParameters.projectId;
  const username = await userHelper.getUserData(event);

  let project;

  try {
    project = await dynamoHelper.getProject(projectId, username);
  } catch(dynamoError){
    console.error(dynamoError);
    return {
      statusCode : 500,
      body : JSON.stringify({
        message : dynamoError.message
      })
    };
  }

  if(!project){
    console.log('No such project found');
    return {
      statusCode : 404,
      body : JSON.stringify({
        message : 'No such project found'
      })
    }
  }

  const workersToUpdate = [];

  Object.keys(body).forEach(team => {
    Object.keys(body[team]).forEach(seniorityLevel => {
      body[team][seniorityLevel].forEach(worker => {
        workersToUpdate.push(worker.username);
      });
    });
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

  try{
    await Promise.all(workersUpdatePromises);

    return {
      statusCode : 200,
      body : JSON.stringify({
        message : 'Team successfully assigned to the project'
      })
    }
  } catch(dynamoError){
    console.error(dynamoError);
    return {
      statusCode : 500,
      body : JSON.stringify({
        message : dynamoError.message
      })
    }
  }
};