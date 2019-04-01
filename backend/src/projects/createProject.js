"use strict";
const dynamoHelper = require('./helpers/dynamoHelper');
const userHelper = require('./helpers/userHelper');
const uuid = require('uuid/v4');
const AJV = require('ajv');
const createProjectSchema = require('./schema/createProject');
const ajv = new AJV({schemas : [createProjectSchema]});

module.exports.handler = async(event) => {
  const body = JSON.parse(event.body);
  const username = userHelper.getUserData(event);

  const isValid = ajv.validate('createProject', body);

  let response;

  if(!isValid){
    console.error('The body received has invalid structure');
    console.error(ajv.errors);
    response = {
      statusCode : 400,
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
      username
    },
    body
  );

  try {
    await dynamoHelper.createProject(projectData);

    response = {
      statusCode : 201,
      body : JSON.stringify({
        message : 'Project was successfully created'
      })
    };

  } catch(dynamoError){
    console.error(dynamoError);

    response = {
      statusCode : 500,
      body : JSON.stringify({
        message : dynamoError.message
      })
    };
  }

  return response;
};