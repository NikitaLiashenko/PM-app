"use strict";
const dynamoHelper = require('./helpers/dynamoHelper');
const utils = require('./helpers/utils');
const AJV = require('ajv');
const updateCalendarSchema = require('./schema/updateCalendar');
const ajv = new AJV({schemas : [updateCalendarSchema]});
const userHelper = require('./helpers/userHelper');

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

  const isValid = ajv.validate('updateCalendar', body);

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

  let calendar;
  try {
    calendar = await dynamoHelper.getCalendar(location);

    if(!calendar){
      return {
        statusCode : 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body : JSON.stringify({
          message : 'No calendar found'
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

  const {updateString, expressionAttributeValues} = utils.prepareUpdateStringAndObject(body);

  try {
    const updatedObject = await dynamoHelper.updateCalendar({
      UpdateExpression: updateString,
      ExpressionAttributeValues: expressionAttributeValues,
      Key: {
        location
      }
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(updatedObject)
    };
  } catch (dynamoError) {
    console.error(dynamoError.message);

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(
        {
          message: dynamoError.message
        }
      )
    }
  }
};