const { curry } = require("rambda");

const add = (x, y) => x + y;

/**
 * PROVIDING THE TRANSFORMATION TO AND FROM THE SAME FUNCTION
 * In these examples, we take any function of two arguments and
 * turn it into a function that takes a pair
 */
const toPair =
  (f) =>
  ([x, y]) =>
    f(x, y);

const fromPair = (f) => (x, y) => f([x, y]);

// const result = toPair(add)([1, 2]);
// const result = fromPair(toPair(add))(1, 2);

/**
 * CURRYING
 * making a function that accepts multiple values to only accept one
 */
//const curry = f => 
//  x => y => f(x, y);

// const uncurry = (f) => 
//   x => y => f(x)(y);

const curriedAdd = curry(add);
const increment = curriedAdd(1);
// const result = increment(4);
// console.log(result);

// Modulo example
const modulo = curry((x, y) => y % x);
const isOdd = modulo(2); // (2, y) => y % 2
// const result = isOdd(3);
// console.log(result);

// Filter example
const filter = curry((f, xs) => xs.filter(f));
const getOdds = filter(isOdd);
// const result = getOdds([1, 2, 3, 4, 5]);

// Replacing chars with regex
const replace = curry((regex, replacement, str) =>
  str.replace(regex, replacement)
);
const replaceVowels = replace(/[AEIOU]/gi, "!");
const result = replaceVowels("Hey I have words");
console.log(result);
