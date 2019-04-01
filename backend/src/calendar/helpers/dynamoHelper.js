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

const createCalendar = async(calendarData) => {
  const params = {
    TableName : config.get('aws.dynamodb.calendar.table'),
    Item : calendarData
  };

  return await dynamo.put(params).promise();
};

const updateCalendar = async(updateParams) => {
  const params = Object.assign(
    {
      TableName : config.get('aws.dynamodb.calendar.table'),
      ReturnValues : "ALL_NEW"
    },
    updateParams
  );

  return await dynamo.update(params).promise()
    .then(result => result.Attributes);
};

module.exports = {
  getUser,
  getCalendar,
  createCalendar,
  updateCalendar
};