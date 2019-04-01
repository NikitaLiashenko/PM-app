"use strict";
global.fetch = require('node-fetch');
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');

module.exports.handler = (event) => {
  const { email, password } = JSON.parse(event.body);
  const poolData = {
    UserPoolId : process.env.USER_POOL_ID,
    ClientId : process.env.CLIENT_ID
  };
  const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

  const attributeList = [];

  const dataEmail = {
    Name : 'email',
    Value : email
  };

  const attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);

  attributeList.push(attributeEmail);

  return new Promise((resolve) => {
    userPool.signUp(email, password, attributeList, null, (signupError, result) => {
      if(signupError){
        if(signupError.code === 'UsernameExistsException'){
          return resolve({
            statusCode: 400,
            body: JSON.stringify({
              message: 'An account with the given email already exists.'
            })
          });
        } else {
          return resolve({
            statusCode: 500,
            body: JSON.stringify({
              message: 'Internal error happen'
            })
          });
        }
      } else {

        return resolve({
          statusCode: 201,
          body: JSON.stringify({
            message: `Successfully signed up. Please check your email for confirmation link`
          })
        });
      }
    });
  });
};