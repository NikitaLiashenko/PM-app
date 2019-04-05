"use strict";
const userHelper = require('./helpers/userHelper');
const dynamoHelper = require('./helpers/dynamoHelper');
const utils = require('./helpers/utils');
const _ = require('lodash');
const momentBusinessDays = require('moment-business-days');

module.exports.handler = async (event) => {
  const projectId = event.pathParameters.projectId;
  const username = userHelper.getUserData(event);
  const body = JSON.parse(event.body);

  if(!body.locations) {
    console.error('The body received has invalid structure');
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

  let project;

  try {
    project = await dynamoHelper.getProject(projectId, username);
  } catch (dynamoError){
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

  if(!project){
    return {
      statusCode : 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body : JSON.stringify({
        message : 'No such project found'
      })
    };
  }

  const locationsRetrievalPromises = [];

  body.locations.forEach(location => {
    locationsRetrievalPromises.push(dynamoHelper.getCalendar(location));
  });

  let calendars;
  try {
    calendars = await Promise.all(locationsRetrievalPromises);
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

  const holidays = calendars.map(location => location.holidays);

  const unique = _.uniqBy(_.flattenDeep(holidays), 'date');

  momentBusinessDays.updateLocale('en', {
    holidays: unique,
    holidayFormat: 'YYYY-MM-DD'
  });

  project.tasks.forEach(task => {
    task.startDate = momentBusinessDays(project.startDate, 'YYYY-MM-DD')
      .businessAdd(task.earlyStart)
      .format('YYYY-MM-DD');
    task.endDate = momentBusinessDays(project.startDate, 'YYYY-MM-DD')
      .businessAdd(task.earlyFinish)
      .format('YYYY-MM-DD');
  });

  project.endDate = momentBusinessDays(project.startDate, 'YYYY-MM-DD')
    .businessAdd(project.projectDuration)
    .format('YYYY-MM-DD');

  project = _.pick(project, ['tasks', 'endDate']);
  const {updateString, expressionAttributeNames, expressionAttributeValues} = utils.prepareUpdateStringAndObject(project);

  let updatedObject;

  try {
    updatedObject = await dynamoHelper.updateProject({
      UpdateExpression : updateString,
      ExpressionAttributeNames : expressionAttributeNames,
      ExpressionAttributeValues : expressionAttributeValues,
      Key : {
        projectId
      }
    });
  } catch(dynamoError){
    console.error(dynamoError);
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
    };
  }

  return {
    statusCode : 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body : JSON.stringify(updatedObject)
  }

};