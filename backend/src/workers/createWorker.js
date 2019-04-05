"use strict";
const dynamoHelper = require('./helpers/dynamoHelper');
const userHelper = require('./helpers/userHelper');
const uuid = require('uuid/v4');
const AJV = require('ajv');
const createWorkerSchema = require('./schema/createWorker');
const ajv = new AJV({schemas : [createWorkerSchema]});

module.exports.handler = async(event) => {
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

  const isValid = ajv.validate('createWorker', body);

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

  const workerData = Object.assign(
    {
      username : uuid(),
      role : 'Worker'
    },
    body
  );

  try {
    await dynamoHelper.createWorker(workerData);

    response = {
      statusCode : 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body : JSON.stringify({
        message : 'Worker was successfully created'
      })
    };

  } catch(dynamoError){
    console.error(dynamoError);

    response = {
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

  return response;
};