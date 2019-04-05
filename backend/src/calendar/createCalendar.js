"use strict";
const dynamoHelper = require('./helpers/dynamoHelper');
const AJV = require('ajv');
const createCalendarSchema = require('./schema/createCalendar');
const userHelper = require('./helpers/userHelper');
const ajv = new AJV({schemas : [createCalendarSchema]});

module.exports.handler = async(event) => {
  const location = event.pathParameters.location;
  const body = JSON.parse(event.body);

  const user = await userHelper.getUserData(event);

  if(user.role !== 'Admin'){
    return {
      statusCode : 403,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body : JSON.stringify({
        message : 'You are not allowed to do this action'
      })
    };
  }

  const isValid = ajv.validate('createCalendar', body);

  if(!isValid){
    console.error('The body received has invalid structure');
    console.error(ajv.errors);
    return {
      statusCode : 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body : JSON.stringify({
        message : 'The body received has invalid structure'
      })
    };
  }

  try {
    const result = await dynamoHelper.getCalendar(location);

    if(result){
      return {
        statusCode : 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body : JSON.stringify({
          message : 'Such calendar already exists'
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

  const calendarData = Object.assign(
    {
      location
    },
    body
  );

  try {
    await dynamoHelper.createCalendar(calendarData);

    return {
      statusCode : 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body : JSON.stringify({
        message : 'Calendar was successfully created'
      })
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
        message : dynamoError.message
      })
    };
  }
};