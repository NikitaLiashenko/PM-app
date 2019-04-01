"use strict";
const dynamoHelper = require('./helpers/dynamoHelper');
const _ = require('lodash');

module.exports.handler = async(event) => {
  const query = event.queryStringParameters;

  if(!(query.locations && query.locations.length > 1)){
    return {
      statusCode : 400,
      body : JSON.stringify({
        message : 'Multiple locations should be provided'
      })
    }
  }

  const locations = JSON.parse(query.locations);

  const locationsRetrievalPromises = [];

  locations.forEach(location => {
    locationsRetrievalPromises.push(dynamoHelper.getCalendar(location));
  });

  let calendars;
  try {
    calendars = await Promise.all(locationsRetrievalPromises);
  } catch(dynamoError){
    console.error(dynamoError);

    return {
      statusCode : 500,
      body : JSON.stringify({
        message: dynamoError.message
      })
    };
  }

  const holidays = calendars.map(location => location.holidays);

  const unique = _.uniqBy(_.flattenDeep(holidays), 'date');

  return {
    statusCode : 200,
    body : JSON.stringify(unique)
  };

};