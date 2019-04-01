"use strict";
const userHelper = require('./helpers/userHelper');
const dynamoHelper = require('./helpers/dynamoHelper');

module.exports.handler = async(event) => {
  const projectId = event.pathParameters.projectId;
  const username = userHelper.getUserData(event);

  try {
    const result = await dynamoHelper.getAllProjectTasks(projectId, username);

    if(!result){
      return {
        statusCode : 404,
        body : JSON.stringify({
          message : 'No tasks or project found'
        })
      }
    }

    return {
      statusCode : 200,
      body : JSON.stringify(result.tasks)
    };
  } catch(dynamoError){
    console.error(dynamoError);

    return {
      statusCode : 500,
      body : JSON.stringify({
        message: dynamoError.message
      })
    };
  }
};