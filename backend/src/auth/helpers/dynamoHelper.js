"use strict";

const config = require('config');
const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

const createUser = async(userData) => {
  const params = {
    TableName : config.get('aws.dynamodb.users.table'),
    Item : userData
  };

  return await dynamo.put(params).promise();
};

const getUser = async(username) => {
  const params = {
    TableName : config.get('aws.dynamodb.users.table'),
    KeyConditionExpression : 'username = :username',
    ExpressionAttributeValues : {
      ':username' : username
    }
  };

  return await dynamo.query(params).promise()
    .then(result => result.Items[0]);
};
module.exports = {
  createUser,
  getUser
};