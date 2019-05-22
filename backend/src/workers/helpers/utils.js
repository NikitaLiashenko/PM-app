"use strict";

function prepareUpdateStringAndObject(inputObject){
  let updateString = 'set ';

  const expressionAttributeValues = {};
  const expressionAttributeNames = {};

  Object.keys(inputObject).forEach(key => {
    updateString += `#${key}= :${key},`;
    expressionAttributeNames[`#${key}`] = key;
    expressionAttributeValues[`:${key}`] = inputObject[key];
  });

  updateString = updateString.slice(0, -1);

  return {
    updateString,
    expressionAttributeValues,
    expressionAttributeNames
  }
}

module.exports = {
  prepareUpdateStringAndObject
};