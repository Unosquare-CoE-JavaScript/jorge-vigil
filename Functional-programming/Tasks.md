# Tasks

Created: April 8, 2022 9:58 AM
tags: functional programming

> Tasks are almost the same as promises
> 

We can start as a Box, only that instead of passing an argument, we make Box hold a function.

```jsx
const Box = f => ({
	map: g => Box(compose(f, g)),
	fold: f
});

Box(() => 2).map(two => two + 1).fold();
```

You can always make a functor lazy with a function. Such as an array has methods like map. A function that can be called at a later time over a data structure.

# Enter task

```jsx
Task.of(2).map(two => two + 1)

// This will just sit there without running the computation
const t1 = Task((rej, res) => res(2))
	.map(two => two + 1)
	.map(three => three * 2)

// Until fork is called
t1.fork(console.log(error), console.log)
```

### Why would you wanna do a lazy promise?

It gives us the hability to write apps with lazy constructions, nothing actually happening. Put those in data structures that only holds their values. Allowing us to compose and combining them without actually execute them.

Then with the fork we’re able to run the whole computation.