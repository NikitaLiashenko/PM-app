"use strict";

const config = require('config');
const AWS = require('aws-sdk');
const _ = require('lodash');
const dynamo = new AWS.DynamoDB.DocumentClient();

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

const getAllWorkers = async() => {
  const params = {
    TableName : config.get('aws.dynamodb.users.table'),
    KeyConditionExpression: '#role = :role',
    IndexName : config.get('aws.dynamodb.users.roleIndex'),
    ExpressionAttributeNames : {
      '#role' : 'role'
    },
    ExpressionAttributeValues: {
      ':role' : 'Worker'
    }
  };

  return await dynamo.query(params).promise()
    .then(result => result.Items);
};

const getWorker = async(workerId) => {
  const params = {
    TableName : config.get('aws.dynamodb.users.table'),
    KeyConditionExpression: 'username = :username and #role = :role',
    IndexName : config.get('aws.dynamodb.users.usernameRoleIndex'),
    ExpressionAttributeNames : {
      '#role' : 'role'
    },
    ExpressionAttributeValues: {
      ':username' : workerId,
      ':role' : 'Worker'
    }
  };

  return await dynamo.query(params).promise()
    .then(result => result.Items[0]);
};

const createWorker = async(workerData) => {
  const params = {
    TableName : config.get('aws.dynamodb.users.table'),
    Item : workerData
  };

  return await dynamo.put(params).promise();
};

const updateWorker = async(updateParams) => {
  const params = Object.assign(
    {
      TableName : config.get('aws.dynamodb.users.table'),
      ReturnValues : "ALL_NEW"
    },
    updateParams
  );

  return await dynamo.update(params).promise()
    .then(result => result.Attributes);
};

const deleteWorker = async(workerId) => {
  const params = {
    TableName : config.get('aws.dynamodb.users.table'),
    Key : {
      "username" : workerId
    }
  };

  return await dynamo.delete(params).promise();
};

module.exports = {
  getUser,
  getAllWorkers,
  getWorker,
  createWorker,
  updateWorker,
  deleteWorker
};