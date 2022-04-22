"use strict";

// async forces the function to return a promise
const plainFunction = async function() {
  console.log('Start');
  return 'done';
};

plainFunction()
  .then(val => console.log(val));