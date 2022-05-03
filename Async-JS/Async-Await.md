# Async Await

Created: April 19, 2022 1:15 PM

<aside>
💡 Simplify promises codification

</aside>

# Async

Async function enables to write promise based code as it was synchronous, without blocking the execution thread

- When `async` is used as a part of a function definition, it forces it to return a promise
    - If the function already returns a value, that value is returned in a promise

# Await

- Can only be used inside an async function
- It waits for a promise
- It causes the async function to pause

<aside>
💡 Async keyword doesn’t cause the code to be asynchronous, it just provides a pattern that allows to work async code in a sync-like fashion

</aside>

```jsx
const swapiFilms = async function() {
  const url = "https://swapi.dev/api/films/";
  let films = [];

  const filmsData = await fetch(url).then(data => data.json());

  films = filmsData.results.map(obj => obj.title);
  console.log(films);
};
```