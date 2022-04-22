"use strict"

const asyncFunction = function() {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve("Important Value");
    }, 2000);
  });
};

const asyncFun = async function() {
  let p1 = await asyncFunction(); // await forces function to pause until p1 is resolved
  console.log(p1);
  console.log(`${p1}-more info`);
};

asyncFun();