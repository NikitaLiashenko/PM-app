"use strict";
const userHelper = require('./helpers/userHelper');
const dynamoHelper = require('./helpers/dynamoHelper');

module.exports.handler = async(event) => {
  const workerId = event.pathParameters.workerId;
  const user = await userHelper.getUserData(event);

  if(user.role !== 'Admin'){
    return {
      statusCode : 403,
      body : JSON.stringify({
        message : 'You are not allowed to do this action'
      })
    };
  }

  let response;

  try {
    await dynamoHelper.deleteWorker(workerId);

    response = {
      statusCode: 204
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