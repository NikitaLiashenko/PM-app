"use strict";
const dynamoHelper = require('./helpers/dynamoHelper');
const userHelper = require('./helpers/userHelper');
const uuid = require('uuid/v4');
const AJV = require('ajv');
const createProjectSchema = require('./schema/createProject');
const ajv = new AJV({schemas : [createProjectSchema]});

module.exports.handler = async(event) => {
  const body = JSON.parse(event.body);
  const user = await userHelper.getUserData(event);

  const isValid = ajv.validate('createProject', body);

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

  const projectData = Object.assign(
    {},
    {
      projectId : uuid(),
      username : user.username
    },
    body
  );

  try {
    await dynamoHelper.createProject(projectData);

    response = {
      statusCode : 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body : JSON.stringify({
        message : 'Project was successfully created',
        project : projectData
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