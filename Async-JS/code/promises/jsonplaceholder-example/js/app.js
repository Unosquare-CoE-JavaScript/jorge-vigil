"use strict";

// fetch('https://jsonplaceholder.typicode.com/todos/')
//   .then(data => data.json())
//   .then(obj => console.log(obj));

let todo = {
  completed: false,
  userId: 1,
  title: "Learn Promises"
};

fetch('https://jsonplaceholder.typicode.com/todos/', {
  method: 'POST',
  headers: {
    "Content-type": "application/json"
  },
  body: JSON.stringify(todo)
})
  .then(response => response.json())
  .then(obj => console.log(obj))
  .catch(reject => console.log(`Unable to create TODO ${reject}`));

console.log('other code...');