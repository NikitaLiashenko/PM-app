"use strict";
const userHelper = require('./helpers/userHelper');
const dynamoHelper = require('./helpers/dynamoHelper');
const utils = require('./helpers/utils');
const AJV = require('ajv');
const updateWorkerSchema = require('./schema/updateWorker');
const ajv = new AJV({schemas : [updateWorkerSchema]});

module.exports.handler = async(event) => {
  const workerId = event.pathParameters.workerId;
  const user = await userHelper.getUserData(event);
  const body = JSON.parse(event.body);

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

  const isValid = ajv.validate('updateWorker', body);

  let response;

  if(!isValid){
    console.error('The body received has invalid structure');
    console.error(ajv.errors);
    response = {
      statusCode : 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body : JSON.stringify({
        message : 'The body received has invalid structure'
      })
    };

    return response;
  }

  const {updateString, expressionAttributeValues, expressionAttributeNames} = utils.prepareUpdateStringAndObject(body);

  try {
    const updatedObject = await dynamoHelper.updateWorker({
      UpdateExpression: updateString,
      ExpressionAttributeNames : expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      Key: {
        username : workerId
      }
    });

    response = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(updatedObject)
    };
  } catch (dynamoError) {
    console.error(dynamoError.message);

    response = {
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

  return response;
};