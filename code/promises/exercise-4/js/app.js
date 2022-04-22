var MAINAPP = (function (nsp) {
  "use strict";

  let url = "https://jsonplaceholder.typicode.com/";

  /*
    Change this code so that it uses Promise.all to respond once all of the promises have returned. Provide a notification to the console when the promises have completed.
    */
  const p1 = fetch(url + "posts/")
    .then((response1) => response1.json());
  
    const p2 = fetch(url + "comments/")
    .then((response2) => response2.json());

  const p3 = fetch(url + "todos/")
    .then((response3) => response3.json());

  Promise.all([p1, p2, p3])
    .then(msg => {
      nsp.posts = msg[0];
      nsp.comments = msg[1];
      nsp.todos = msg[2];
      console.log("All data received!");
    })
    .catch(err => console.log(err));

  //public
  return nsp;
})(MAINAPP || {});
