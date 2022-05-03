# Promises

Created: April 19, 2022 12:53 PM

- A promise is an object with properties & methods
- Represents the eventual completion (or failure) of an async operation
- Provides a resulting value

```jsx
let a = new Promise((resolve, reject) => {
	setTimeout(() => {
		resolve('Done');
	}, 4000);
});

a.then(val => {
	console.log(val);
}, val => {
	console.log('reject:' + val);
});
```

A promise is created with one parameter: a callback function with two parameters: `resolve` and `reject`. Both are callback functions that return the value assigned to them in case of success or failure of the promise.

The result of a promise can then be used (or consumed) within a `then` block.

## Fetch

The fetch function returns a promise, so its asynchronous and its result can be consumed with `then` and `catch` blocks

```jsx
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
```