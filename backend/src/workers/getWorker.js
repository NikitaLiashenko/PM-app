"use strict";
const dynamoHelper = require('./helpers/dynamoHelper');

module.exports.handler = async(event) => {
  const workerId = event.pathParameters.workerId;

  try {
    const result = await dynamoHelper.getWorker(workerId);

    if(!result){
      return {
        statusCode : 404,
        body : JSON.stringify({
          message : 'No such worker found'
        })
      }
    }

    return {
      statusCode : 200,
      body : JSON.stringify(result)
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