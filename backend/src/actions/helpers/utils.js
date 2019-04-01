"use strict";
const _ = require('lodash');
const uuid = require('uuid/v4');
const moment = require('moment');

const prepareGraphAndOrder = (tasks) => {
  const idsArray = [];
  tasks.forEach(task => {
    if(!task.predecessor.length){
      idsArray.push(task.taskId);
    }
  });

  tasks = tasks.map(task => _.omit(task, ['orderId']));

  const graph = [];
  const tasksAmount = tasks.length;
  for(let i = 0; i < tasksAmount; i++){
    graph.push(Array(tasksAmount).fill(0, 0, tasksAmount))
  }

  let pointIndex = 0;
  let idsArrayIndex = 0;
  while(true){
    const currentId = idsArray[idsArrayIndex];
    const taskIndex = tasks.findIndex(task => task.taskId === currentId);
    if(!tasks[taskIndex].orderId){
      tasks[taskIndex].orderId = pointIndex;
      pointIndex++;
    }

    tasks.forEach(task => {
      if(task.predecessor.includes(currentId)){
        if(!task.orderId) {
          task.orderId = pointIndex;
          pointIndex++;
        }
        graph[tasks[taskIndex].orderId][task.orderId] = 1;

        if(!idsArray.includes(task.taskId)) {
          idsArray.push(task.taskId);
        }
      }
    });

    idsArrayIndex++;

    if(idsArrayIndex === tasksAmount){
      break;
    }
  }

  tasks.sort((task1, task2) => task1.orderId > task2.orderId);

  return {
    tasks,
    graph
  };
};

const countDirect = (tasks, graph) => {
  for( let i = 0; i < tasks.length; i++){
    if(i === 0){
      tasks[i].earlyStart = 0;
      tasks[i].earlyFinish = tasks[i].estimateMax;
    } else {
      let maxValue = 0;
      for(let j = 0; j < i; j++){
        if(graph[j][i] && tasks[j].earlyFinish > maxValue){
          maxValue = tasks[j].earlyFinish;
        }
      }
      tasks[i].earlyStart = maxValue;
      tasks[i].earlyFinish = tasks[i].earlyStart + tasks[i].estimateMax;
    }
  }
  return tasks;
};

const countProjectDuration = (tasks) => {
  return Math.max(...tasks.map(task => task.earlyFinish));
};

const countBackward = (tasks, graph) => {
  for( let i = tasks.length - 1; i >= 0; i--){
    const isAtTheEnd = graph[i].reduce((a, b) => a + b) === 0;
    if(isAtTheEnd){
      tasks[i].lateFinish = tasks[i].earlyFinish;
      tasks[i].lateStart = tasks[i].lateFinish - tasks[i].estimateMax;
    } else {
      let minValue = Number.MAX_SAFE_INTEGER;
      for (let j = i; j < tasks.length; j++){
        if(graph[i][j] && tasks[j].lateStart < minValue){
          minValue = tasks[j].lateStart;
        }
      }
      tasks[i].lateFinish = minValue;
      tasks[i].lateStart = tasks[i].lateFinish - tasks[i].estimateMax;
    }
  }

  return tasks;
};

const countCriticalPath = (tasks) => {
  for (let i = 0; i < tasks.length; i++){
    tasks[i].isOnCritPath = tasks[i].lateFinish === tasks[i].earlyFinish;
  }
  return tasks;
};

const countFloats = (tasks) => {
  for (let i = 0; i < tasks.length; i++){
    tasks[i].startFloat = tasks[i].lateStart - tasks[i].earlyStart;
    tasks[i].finishFloat = tasks[i].lateFinish - tasks[i].earlyFinish;
  }

  return tasks;
};

const countFreeFloat = (tasks, graph) => {
  for(let i = 0; i < tasks.length; i++){
    let minSuccessorEarlyStart = Number.MAX_SAFE_INTEGER;
    for(let j = i; j < tasks.length; j++){
      if(graph[i][j] && tasks[j].earlyStart < minSuccessorEarlyStart){
        minSuccessorEarlyStart = tasks[j].earlyStart;
      }
    }
    tasks[i].freeFloat = minSuccessorEarlyStart - tasks[i].earlyStart - tasks[i].estimateMax;
  }
  return tasks;
};

function prepareUpdateStringAndObject(inputObject){
  let updateString = 'set ';

  const expressionAttributeValues = {};
  const expressionAttributeNames = {};

  Object.keys(inputObject).forEach(key => {
    updateString += `#${key}= :${key},`;
    expressionAttributeValues[`:${key}`] = inputObject[key];
    expressionAttributeNames[`#${key}`] = key;
  });

  updateString = updateString.slice(0, -1);

  return {
    updateString,
    expressionAttributeValues,
    expressionAttributeNames
  }
}

const getParallelIndexes = (index, points, graph) => {
  const parallelIndexes = [];
  let prev, next;
  //searching prev
  for(let i = 0; i < graph.length; i++){
    if(graph[i][index]){
      prev = i;
    }
  }
  //searching next
  for(let i = 0; i < graph.length; i++){
    if(graph[index][i]){
      next = i;
    }
  }

  for(let i = 0; i < graph.length; i++){
    if(prev &&
      next &&
      graph[i][next] &&
      graph[prev][i] &&
      i !== index &&
      points[i].isOnCritPath){
      parallelIndexes.push(i);
    }
  }

  return parallelIndexes;
};

const getParallelCrashAvailable = (indexes, actions) => {
  if(indexes.length) {
    let isAvailable = true;
    indexes.forEach(index => {
      if (!(actions[index].estimateMax - actions[index].estimateMin)) {
        isAvailable = false;
      }
    });
    return isAvailable;
  }
  return false;
};

const countCrash = (tasks, graph, overheadCostPerDay) => {
  let runNumber = 0;
  const result = [];

  const activityDirect = countDirect(tasks, graph);

  const projectDuration = countProjectDuration(activityDirect);

  const activityBackward = countBackward(activityDirect, graph);

  const activityFloats = countFloats(activityBackward);

  let activityCritPath = countCriticalPath(activityFloats);

  const daysCost = overheadCostPerDay * projectDuration;

  let activityCost = 0;

  for(let i = 0; i < activityCritPath.length; i++){
    activityCost += activityCritPath[i].taskCost;
  }

  const projectCost = daysCost + activityCost;

//setting initial
  result[0] = {};

  for (let i = 0; i < activityCritPath.length; i++){
    result[0][activityCritPath[i].taskId] = {
      estimateMax : activityCritPath[i].estimateMax,
      estimateMin : activityCritPath[i].estimateMin,
      crashCost : activityCritPath[i].crashCost,
      TF : activityCritPath[i].finishFloat
    };
  }

  result[0].crashId = 'initial';
  result[0].cost = null;
  result[0].save = null;
  result[0].projectCost = projectCost;
  result[0].projectDuration = projectDuration;
  result[0].runNumber = runNumber;
  runNumber++;

  while(true){
    const runResult = {};
    for(let i = 0; i < activityCritPath.length; i++){
      runResult[activityCritPath[i].taskId] = {};
    }

    //checking if crash is available
    let availableCrashDuration = 0;
    for(let i = 0; i < activityCritPath.length; i++){
      if(activityCritPath[i].isOnCritPath) {
        availableCrashDuration += activityCritPath[i].estimateMax - activityCritPath[i].estimateMin;
      }
    }
    if(!availableCrashDuration){
      break;
    }

    //searching for cheapest crash

    let cheapestCrashIndex;
    let hasParallel = false;
    let cheapestCrashCost = Number.MAX_SAFE_INTEGER;
    for(let i = 0; i < activityCritPath.length; i++){
      if(activityCritPath[i].isOnCritPath &&
        activityCritPath[i].estimateMax - activityCritPath[i].estimateMin > 0 &&
        activityCritPath[i].crashCost < cheapestCrashCost){
        cheapestCrashIndex = i;
        cheapestCrashCost = activityCritPath[i].crashCost;
      }
    }

    const parallelIndexes = getParallelIndexes(cheapestCrashIndex, activityCritPath, graph);
    const isParallelCrashAvailable = getParallelCrashAvailable(parallelIndexes, activityCritPath);
    if(parallelIndexes.length){
      if(isParallelCrashAvailable) {
        hasParallel = true;
      } else {
        break;
      }
    }

    const updatedActions = [];
    for(let i = 0; i < activityCritPath.length; i++){
      if(i === cheapestCrashIndex || parallelIndexes.includes(i)){
        runResult[activityCritPath[i].taskId].daysSaved = 1;
        runResult[activityCritPath[i].taskId].estimateMax = activityCritPath[i].estimateMax - 1;
        updatedActions.push({
          estimateMax : activityCritPath[i].estimateMax - 1,
          taskId : activityCritPath[i].taskId,
          estimateMin : activityCritPath[i].estimateMin,
          crashCost : activityCritPath[i].crashCost
        });
      } else {
        runResult[activityCritPath[i].taskId].daysSaved = 0;
        runResult[activityCritPath[i].taskId].estimateMax = activityCritPath[i].estimateMax;
        updatedActions.push({
          estimateMax : activityCritPath[i].estimateMax,
          taskId : activityCritPath[i].taskId,
          estimateMin : activityCritPath[i].estimateMin,
          crashCost : activityCritPath[i].crashCost
        });
      }
    }

    const updatedActivityDirect = countDirect(updatedActions, graph);

    const updatedProjectDuration = countProjectDuration(updatedActivityDirect);

    const updatedActivityBackward = countBackward(updatedActivityDirect, graph);

    const updatedActivityFloats = countFloats(updatedActivityBackward);

    const updatedActivityCritPath = countCriticalPath(updatedActivityFloats);

    for(let i = 0; i < updatedActivityCritPath.length; i++){
      runResult[updatedActivityCritPath[i].taskId].TF = updatedActivityCritPath[i].finishFloat;
    }

    if(!hasParallel) {
      runResult.cost = cheapestCrashCost;
    } else {
      runResult.cost = 0;
      for(let i = 0; i < updatedActivityCritPath.length; i++){
        if (i === cheapestCrashIndex || parallelIndexes.includes(i)){
          runResult.cost += updatedActivityCritPath[i].crashCost;
        }
      }

    }
    runResult.save = overheadCostPerDay;
    runResult.projectCost = result[result.length - 1].projectCost + runResult.cost - overheadCostPerDay;
    runResult.projectDuration = updatedProjectDuration;
    runResult.crashId = uuid();
    runResult.runNumber = runNumber;
    runNumber++;

    result.push(runResult);
    activityCritPath = updatedActivityCritPath;
  }

  return result;

};

function checkAvailability(projectParams, key, worker){
  const vacationsDiff = worker.vacations.map(vacation => moment(projectParams[key].teamStartDate).diff(moment(vacation.endDate)));
  let isFree = true;
  vacationsDiff.forEach(diff => {
    if(diff < 0) {
      isFree = false;
    }
  });

  if(worker.project){
    if(moment(projectParams[key].teamStartDate).diff(moment(worker.project.endDate)) < 0){
      isFree = false;
    }
  }
  return isFree;
}

function prepareTeam(projectParams, workers){
  const result = {};

  Object.keys(projectParams).forEach(key => {
    result[key] = [];
    const ratings = {};

    const appropriateDevelopers = workers.filter(worker => {
      const isMainSkillSame = worker.mainSkill === projectParams[key].mainSkill;
      const isSeniorityAppropriate = Object.keys(projectParams[key].seniority).includes(worker.seniorityLevel);
      const isAvailableOnStartDate = checkAvailability(projectParams, key, worker);

      let isOk = true;
      [isMainSkillSame, isSeniorityAppropriate, isAvailableOnStartDate].forEach(condition => {
        if(!condition){
          isOk = false;
        }
      });
      return isOk;
    });

    appropriateDevelopers.forEach(developer => {
      const skillRating = _.intersection(projectParams[key].skills, developer.skills).length / projectParams[key].skills.length;

      if(ratings[developer.seniorityLevel]){
        ratings[developer.seniorityLevel].push(Object.assign({},
          developer,
          {
            rating : skillRating
          }))
      } else {
        ratings[developer.seniorityLevel] = [Object.assign({},
          developer,
          {
            rating : skillRating
          })];
      }
    });

    Object.keys(ratings).forEach(seniority => {
      ratings[seniority].sort((a, b) => a.rating < b.rating);
      ratings[seniority] = ratings[seniority].slice(0, projectParams[key].seniority[seniority]);
    });

    result[key] = ratings;
  });

  return result;
}

function prepareWorkerProjectAssignParams(projectId, projectEndDate){
  return {
    updateString : 'set #project = :project',
    expressionAttributeNames: {
      '#project' : 'project'
    },
    expressionAttributeValues: {
      ':project' : {
        projectId,
        endDate : projectEndDate
      }
    }
  }
}

module.exports = {
  prepareGraphAndOrder,
  countDirect,
  countBackward,
  countCriticalPath,
  countFloats,
  countFreeFloat,
  countProjectDuration,
  prepareUpdateStringAndObject,
  countCrash,
  prepareTeam,
  prepareWorkerProjectAssignParams
};