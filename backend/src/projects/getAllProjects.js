"use strict";
const userHelper = require('./helpers/userHelper');
const dynamoHelper = require('./helpers/dynamoHelper');

module.exports.handler = async(event) => {

  const user = await userHelper.getUserData(event);

  console.log(user);
  if(user.role === 'Manager') {

    try {
      const projects = await dynamoHelper.getAllProjectsForUser(user.username);

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify(projects)
      };
    } catch (dynamoError) {
      console.error(dynamoError);

      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
          message: dynamoError.message
        })
      };
    }
  } else {
    try {
      const projects = await dynamoHelper.getAllProjects();

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify(projects)
      };
    } catch (dynamoError) {
      console.error(dynamoError);

      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
          message: dynamoError.message
        })
      };
    }
  }
};