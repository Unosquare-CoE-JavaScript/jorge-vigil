var MAINAPP = (function (nsp) {
  ("use strict");

  let url = 'https://jsonplaceholder.typicode.com';

  /*
    This IIFE is the start of an application. The first thing we want to do is download all the posts, 
    comments and todos so that we can work with them. Add the code in order to do that. 
    Also, make sure that you add the posts, comments and todos to the MAINAPP variable so 
    they are accessible outside this function (e.g. nsp.posts = posts & return nsp). 
    Because the code is asynchronous, you will need to consider the best way to do that.
    */
  fetch(url + '/posts')
    .then(response => response.json())
    .then(posts => nsp.posts = posts)
    .catch(reject => console.log(`Posts could not be retreived ${reject}`));
  
  fetch(url + '/comments')
    .then(response => response.json())
    .then(comments => nsp.comments = comments)
    .catch(reject => console.log(`Comments could not be retreived ${reject}`));
  
  fetch(url + '/todos')
    .then(response => response.json())
    .then(todos => nsp.todos = todos)
    .catch(reject => console.log(`Todos could not be retreived ${reject}`));
  //public
  return nsp;
})(MAINAPP || {});
