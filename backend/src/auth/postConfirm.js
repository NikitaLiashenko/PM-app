"use strict";

const dynamoHelper = require('./helpers/dynamoHelper');

module.exports.handler = async(event, context) => {
  const username = event.userName;
  const email = event.request.userAttributes.email;

  const userData = {
    username,
    email,
    role : 'Manager'
  };

  try {
    await dynamoHelper.createUser(userData);
  } catch(dynamoError){
    console.error(dynamoError);

    context.done(dynamoError, event);
  }

  context.done(null, event);
};
