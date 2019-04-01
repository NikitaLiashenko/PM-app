"use strict";
const userHelper = require('./helpers/userHelper');
const dynamoHelper = require('./helpers/dynamoHelper');

module.exports.handler = async(event) => {

  const username = userHelper.getUserData(event);

  try {
    const projects = await dynamoHelper.getAllProjects(username);

    return {
      statusCode : 200,
      body : JSON.stringify(projects)
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