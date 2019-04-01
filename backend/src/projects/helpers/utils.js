"use strict";

function prepareUpdateStringAndObject(inputObject){
  let updateString = 'set ';
  const expressionAttributeValues = {};

  Object.keys(inputObject).forEach(key => {
    if (Array.isArray(inputObject[key])){
      updateString += `${key}= list_append(${key}, :${key}),`
    } else {
      updateString += `${key}= :${key},`;
    }
    expressionAttributeValues[`:${key}`] = inputObject[key];
  });

  updateString = updateString.slice(0, -1);

  return {
    updateString,
    expressionAttributeValues
  }
}

module.exports = {
  prepareUpdateStringAndObject
};