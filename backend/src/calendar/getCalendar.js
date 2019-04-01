"use strict";
const dynamoHelper = require('./helpers/dynamoHelper');

module.exports.handler = async(event) => {
  const location = event.pathParameters.location;

  try {
    const result = await dynamoHelper.getCalendar(location);

    if(!result){
      return {
        statusCode : 404,
        body : JSON.stringify({
          message : 'No such calendar found'
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