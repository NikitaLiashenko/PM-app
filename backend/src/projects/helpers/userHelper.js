"use strict";
const jwt = require('jsonwebtoken');
const dynamoHelper = require('./dynamoHelper');
const _ = require('lodash');

const getUserData = async (event) => {
  const username = jwt.decode(event.requestContext.authorizer.principalId).username;
  return await dynamoHelper.getUser(username);
};
module.exports = {
  getUserData
};