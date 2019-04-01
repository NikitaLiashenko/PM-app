"use strict";
const jwt = require('jsonwebtoken');
const dynamoHelper = require('./dynamoHelper');
const _ = require('lodash');

const getUserData = async (event) => {
  const username = jwt.decode(event.requestContext.authorizer.principalId).username;
  const user = await dynamoHelper.getUser(username);

  return _.omit(user, ['username']);
};
module.exports = {
  getUserData
};