"use strict";

let a = new Promise((resolve, reject) => {
  setTimeout(() => {
    reject("Done");
  }, 4000);
});

a.then(val => {
  console.log(val);
}, val => {
  console.log('reject:' + val);
});

console.log("see this is asynch code");
