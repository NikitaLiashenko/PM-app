"use strict";

const config = require('config');
const AWS = require('aws-sdk');
const _ = require('lodash');
const dynamo = new AWS.DynamoDB.DocumentClient();

const getAllProjectsForUser = async(username) => {
  const params = {
    TableName : config.get('aws.dynamodb.projects.table'),
    KeyConditionExpression : 'username = :username',
    IndexName : config.get('aws.dynamodb.projects.usernameIndex'),
    ExpressionAttributeValues : {
      ':username' : username
    }
  };

  return await dynamo.query(params).promise()
    .then(result => result.Items)
    .then(projects => projects.map(item => _.omit(item, ['username'])));
};

const getAllProjects = async() => {
  const params = {
    TableName : config.get('aws.dynamodb.projects.table')
  };

  return await dynamo.scan(params).promise()
    .then(result => result.Items)
    .then(projects => projects.map(item => _.omit(item, ['username'])));
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

const getProject = async(username, projectId) => {
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

const createProject = async(projectData) => {
  const params = {
    TableName : config.get('aws.dynamodb.projects.table'),
    Item : projectData
  };

  return await dynamo.put(params).promise();
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

module.exports = {
  getAllProjectsForUser,
  getAllProjects,
  createProject,
  getProject,
  updateProject,
  getUser
};