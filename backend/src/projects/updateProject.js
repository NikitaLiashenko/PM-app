"use strict";
const dynamoHelper = require('./helpers/dynamoHelper');
const userHelper = require('./helpers/userHelper');
const utils = require('./helpers/utils');
const _ = require('lodash');
const AJV = require('ajv');
const updateProjectSchema = require('./schema/updateProject');
const ajv = new AJV({schemas : [updateProjectSchema]});

module.exports.handler = async(event) => {
  const body = JSON.parse(event.body);
  const projectId = event.pathParameters.projectId;
  const username = userHelper.getUserData(event);

  const isValid = ajv.validate('updateProject', body);

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

  let project;

  try {
    project = await dynamoHelper.getProject(username, projectId);
  } catch(dynamoError){
    console.error(dynamoError.message);

    response = {
      statusCode : 500,
      body : JSON.stringify({
        message: dynamoError.message
      })
    };

    return response;
  }

  if(!project){
    response = {
      statusCode : 404,
      body : JSON.stringify({
        message : 'No such project found'
      })
    };

    return response;
  }

  const {updateString, expressionAttributeValues} = utils.prepareUpdateStringAndObject(body);

  try {
    const updatedObject = await dynamoHelper.updateProject({
      UpdateExpression: updateString,
      ExpressionAttributeValues: expressionAttributeValues,
      Key: {
        projectId
      }
    });

    response = {
      statusCode: 200,
      body: JSON.stringify(_.omit(updatedObject, ['username', 'risks']))
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