# Synchronous vs Asynchronous

Created: April 19, 2022 12:32 PM

> One piece of code must finish before the next one can start
> 

This may incur in blocking of the flow (ie. a request that block all interaction in the page, or a long process)

```jsx
const test = function() {
    console.log("Start of code");
    alert("Notice Me!");
    console.log("End of code");
};

const testAsync = function() {
    setTimeout(function() {
        console.log("Start of code");
        alert("Notice Me!");
        console.log("End of code");
    }, 1000);
};

const test2 = function() {
    console.log("Now I get attention");
};

test();
test2();
```

In the previous example, the program is executed line by line, while things like alerts in the `test` function pauses the execution

That means the `test2` call can only start when `test` finishes its execution

> Blocking happens when a very expensive app takes the time other processes could be using
> 

<aside>
💡 Adding a `setTimeout` makes the `test` function asynchronous. In the example, its the `testAsync` function

</aside>

Making `test` asynchronous means `test2` can execute without test blocking it

# Sync code

### Advantages

- Easy to understand and write

### Disadvantages

- May create blocking code
- Less performant

# Async code

### Advantages

- Very performant
- Eliminates code blocking

### Disadvantages

- Difficult to understand
- Hard to write