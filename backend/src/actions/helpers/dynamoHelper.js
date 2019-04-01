"use strict";

const config = require('config');
const AWS = require('aws-sdk');
const _ = require('lodash');
const dynamo = new AWS.DynamoDB.DocumentClient();

const getProject = async(projectId, username) => {
  const params = {
    TableName : config.get('aws.dynamodb.projects.table'),
    KeyConditionExpression : 'username = :username and projectId = :projectId',
    IndexName : config.get('aws.dynamodb.projects.projectIdUsernameIndex'),
    ExpressionAttributeValues : {
      ':username' : username,
      ':projectId' : projectId
    }
  };

  return await dynamo.query(params).promise()
    .then(result => result.Items[0]);
};

const updateProject = async(updateParams) => {
  const params = Object.assign(
    {
      TableName : config.get('aws.dynamodb.projects.table'),
      ReturnValues : "ALL_NEW"
    },
    updateParams
  );

  return await dynamo.update(params).promise()
    .then(result => result.Attributes);
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

const getCalendar = async(location) => {
  const params = {
    TableName : config.get('aws.dynamodb.calendar.table'),
    KeyConditionExpression: '#location = :location',
    ExpressionAttributeNames : {
      '#location' : 'location'
    },
    ExpressionAttributeValues: {
      ':location' : location
    }
  };

  return await dynamo.query(params).promise()
    .then(result => result.Items[0]);
};

module.exports = {
  getProject,
  updateProject,
  getAllWorkers,
  updateWorker,
  getCalendar
};