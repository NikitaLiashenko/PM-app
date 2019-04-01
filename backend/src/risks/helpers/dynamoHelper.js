"use strict";

const config = require('config');
const AWS = require('aws-sdk');
const _ = require('lodash');
const dynamo = new AWS.DynamoDB.DocumentClient();

const getAllProjectRisks = async(projectId, username) => {
  const params = {
    TableName : config.get('aws.dynamodb.projects.table'),
    KeyConditionExpression : 'username = :username and projectId = :projectId',
    IndexName : config.get('aws.dynamodb.projects.projectIdUsernameIndex'),
    ProjectionExpression : 'risks',
    ExpressionAttributeValues : {
      ':username' : username,
      ':projectId' : projectId
    }
  };

  return await dynamo.query(params).promise()
    .then(result => result.Items[0]);
};

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

module.exports = {
  getAllProjectRisks,
  getProject,
  updateProject
};