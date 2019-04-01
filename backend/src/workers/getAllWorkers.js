"use strict";
const dynamoHelper = require('./helpers/dynamoHelper');

module.exports.handler = async(event) => {

  try {
    const result = await dynamoHelper.getAllWorkers();

    if(!result){
      return {
        statusCode : 404,
        body : JSON.stringify({
          message : 'No workers found'
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