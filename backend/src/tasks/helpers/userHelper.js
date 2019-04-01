"use strict";
const jwt = require('jsonwebtoken');

const getUserData = (event) => {
  return jwt.decode(event.requestContext.authorizer.principalId).username;
};
module.exports = {
  getUserData
};