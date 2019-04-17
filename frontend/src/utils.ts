import * as _ from 'lodash';

const omitNilAndEmptyStrings = (input : any) => {
  if (Array.isArray(input)){
    input.forEach(item => {
      omitNilAndEmptyStrings(item);
    });
  }

  Object.keys(input).forEach(key => {
    if (_.isNil(input[key]) || input[key] === ''){
      delete input[key];
    }

    if (typeof input[key] === 'object'){
      omitNilAndEmptyStrings(input[key]);
    }
  });
};

export default {
  omitNilAndEmptyStrings
};