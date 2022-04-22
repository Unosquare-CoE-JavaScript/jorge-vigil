"use strict";

const swapi = function(num) {
  let url = "https://swapi.dev/api/people/";

  fetch(url + num + '/')
    .then(data => data.json())
    .then(obj => {
      console.log(obj);
      return fetch(obj.homeworld);
    })
    .then(hwdata => hwdata.json())
    .then(hwObj => console.log(hwObj));
};

swapi(1);

console.log("This code is asynchronous!");