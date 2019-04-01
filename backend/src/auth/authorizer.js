"use strict";

const generatePolicy = (authToken, methodArn) => {
  const tmp = methodArn.split(`:`);
  const apiGatewayArnTmp = tmp[5].split(`/`);
  const awsAccountId = tmp[4];
  const region = tmp[3];
  const restApiId = apiGatewayArnTmp[0];
  const stage = apiGatewayArnTmp[1];

  return {
    principalId : authToken.split(`-`)[0],
    policyDocument : {
      Version : `2012-10-17`,
      Statement : [{
        Effect : `Allow`,
        Action : [
          `execute-api:Invoke`
        ],
        Resource : [
          `arn:aws:execute-api:${region}:${awsAccountId}:${restApiId}/${stage}/GET/project*`,
          `arn:aws:execute-api:${region}:${awsAccountId}:${restApiId}/${stage}/POST/project*`,
          `arn:aws:execute-api:${region}:${awsAccountId}:${restApiId}/${stage}/PUT/project*`,
          `arn:aws:execute-api:${region}:${awsAccountId}:${restApiId}/${stage}/DELETE/project*`,
          `arn:aws:execute-api:${region}:${awsAccountId}:${restApiId}/${stage}/GET/worker*`,
          `arn:aws:execute-api:${region}:${awsAccountId}:${restApiId}/${stage}/POST/worker*`,
          `arn:aws:execute-api:${region}:${awsAccountId}:${restApiId}/${stage}/PUT/worker*`,
          `arn:aws:execute-api:${region}:${awsAccountId}:${restApiId}/${stage}/DELETE/worker*`,
          `arn:aws:execute-api:${region}:${awsAccountId}:${restApiId}/${stage}/GET/calendar*`,
          `arn:aws:execute-api:${region}:${awsAccountId}:${restApiId}/${stage}/POST/calendar*`,
          `arn:aws:execute-api:${region}:${awsAccountId}:${restApiId}/${stage}/PUT/calendar*`,
        ]
      }]
    }
  };
};

module.exports.handler = (event, context, callback) => {
  console.log(event);

  if(event && event.authorizationToken && event.methodArn){
    callback(null, generatePolicy(event.authorizationToken, event.methodArn));
  } else {
    callback(`Unauthorized`);
  }
};