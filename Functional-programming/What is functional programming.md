# What is functional programming?

Created: April 6, 2022 4:12 PM
tags: functional programming, intro, javascript

### Every function is

A single collection of pairs:

$$
(-2, -1)\\( 0, 0 )\\(2, 1)\\(4, 2)\\(8, 4)
$$

The left side is called *domain* while the left one is the *range*.

### Is a function if

1. Total
2. Deterministic
3. No observable side effects

## Total

A function is total if for every input there’s a corresponding output

![Untitled](What%20is%20functional%20programming/Untitled.png)

The left one is not total since it returns undefined values for any *i* greater than 2.

> A function being total means the contract that you’ll always have a value on the range
> 

## Deterministic

A function is deterministic if it always returns the same output for a given input

![Untitled](What%20is%20functional%20programming/Untitled%201.png)

The left one is not deterministic since it’s gonna return different outputs for the same input.

## No side effects

Its not a function if any side effects can be observed.

![Untitled](What%20is%20functional%20programming/Untitled%202.png)

> How to know if its an observable side effect? my computer got hotter :D
> 

> If any change on the state of the observable world is changed
> 

ie. changes on the database, log to console, etc.

### Example 1

![Untitled](What%20is%20functional%20programming/Untitled%203.png)

On the left we have different outputs for the same input. While on the right, same input, same output.

### Example 2

![Untitled](What%20is%20functional%20programming/Untitled%204.png)

The left example has the purpose of returning a slug but if it fails throws an error at your face and halts execution. The right returns a promise with either the resolution of the generated slug or the rejected instance of the error.

### Example 3

![Untitled](What%20is%20functional%20programming/Untitled%205.png)

A lot of side effects in the left one. On the right, we return a function that will do all those effects. Eliminating the side effects by returning a function is a common practice.

## Advantages

- Reliable
- Portable
- Reusable
- Testable
- Composable
- Properties/contract