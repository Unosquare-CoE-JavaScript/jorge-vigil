# Functors

Created: April 7, 2022 3:53 PM

```jsx
const nextCharForNumberString = str => {
	const trimmed = str.trim;
	const number = parseInt(trimmed);
	const nextNumber = number + 1;
	return String.fromCharCode(nextNumber);
}

const result = nextCharForNumberString('64')
```

How do we dot chain this?

```jsx
const Box = x => ({
	map: f => Box(f(x))
})
```

> Looks recursive, although its not.
> 

> Run the function on the x but keep it in the box
> 

Its the same as doing this:

```jsx
const result = () => 
	['a']
	.map(x => x.toUpperCase())         // which returns a ['A']
	.map(x => String.fromCharCode(x))  // which returns ['\u0000']
```

When doing this we’re able to combine different function calls in a composition pipeline by using an array and mapping over it.

<aside>
💡 With “Box” we define our own “array” and operate over it as shown above

</aside>

```jsx
const Box = x => ({
	map: f => Box(f(x)),
	fold: f => f(x)
});

const nextCharForNumberString = str => 
	Box(str)
	.map(x => x.trim())
	.map(trimmed => parseInt(trimmed, 10))
	.map(number => new Number(number + 1))
	.fold(String.fromCharCode)
```

<aside>
💡 Fold takes a function with a value: “Gimme a function and I’ll give you the thing I’m holding”

</aside>

With a functor, we’re able to take all the code above that was not composable and compose it. Doesn’t require extra variables or to analyze linear code that generates extra state.

## When needed to implement a box within a box

```jsx
const applyDiscount = (price, discount) =>
  Box(moneyToFloat(price)) 
  .fold(cents => 
       Box(percentToFloat(discount))
       .fold(savings => cents - (cents * savings)));
```

In this case, we have a Box that holds the value of a function call, unfolds it and is then unfolded by the external Box.

<aside>
💡 A solution for simplifying this is the chaining or flatMap

</aside>

```jsx
const Box = x => ({
	map: f => Box(f(x)),
	chain: f => f(x),
	fold: f => f(x)
});

const applyDiscount = (price, discount) =>
  Box(moneyToFloat(price)) 
  .chain(cents => 
       Box(percentToFloat(discount))
       .map(savings => cents - (cents * savings)) // Box(Box(x))
	)
	.fold(x => x);
```