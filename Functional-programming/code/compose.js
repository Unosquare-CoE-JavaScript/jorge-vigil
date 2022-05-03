const { compose } = require("rambda");

/**
 * COMPOSITION
 */

const add = (x, y) => x + y;

const concat = curry((y, x) => x + y);

const toUpper = str => str.toUpperCase();

const exclaim = str => str + '!';

const first = xs => xs[0];

// const compose = (f, g) => x => f(g(x));

// const shout = compose(exclaim, toUpper);
// const shout = compose(first, compose(exclaim, toUpper));

// logging in composition
const log = curry((tag, x) => (console.log(tag, x), x));

// compose is also available in rambda
const loudFirst = compose(toUpper, first);
const shout = compose(exclaim, loudFirst, log('here:'));

console.log(shout('tears'));
 
 