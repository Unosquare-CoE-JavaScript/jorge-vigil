# Either

Created: April 7, 2022 5:59 PM

Let’s start with an example

```jsx
const findColor = name => 
	({red: '#ff4444', blue: '#3b5998', yellow: '#fff68f'}[name]);

const res = findColor('red').toUpperCase();

console.log(res);
```

Now, making the following call it will return undefined

```jsx
const res = findColor('re'); // will return undefined
```

How do we solve that?

```jsx
const Right = x => ({
	chain: f => f(x),
	map: f => Right(f(x)),
	fold: (f, g) => g(x),
	toString: `Right(${x})`
});

const Left = x => ({
	chain: f => Left(x),
	map: f => Left(x),
	fold: (f, g) => f(x),
	toString: `Left(${x})`
});

const findColor = name => {
	const found = {red: '#ff4444', blue: '#3b5998', yellow: '#fff68f'}[name];
	return found ? Right(found) : Left('not found');
};

// we can invoke it in a chain fashion as follow without the risk of it blowing up
const res = () =>
	findColor('redd')
	.map(x => x.toUpperCase()); 
```

<aside>
💡 The previous example will not invoke the toUpperCase method and thus will not throw an exception when the color is undefined

</aside>

In that case, when needed to access the founded (or not founded) value of the function:

```jsx
const res = () =>
	findColor('redd')
	.map(x => x.toUpperCase())
	.fold(
		() => 'no color!',
		color => color
	);

console.log(res());
```

# From nullable

We can wrap the previous findColor function around a fromNullable object

```jsx
const fromNullable = x =>
	x != null ? Right(x) : Left();

const findColor = name => {
	fromNullable({red: '#ff4444', blue: '#3b5998', yellow: '#fff68f'}[name]);
};
```

# Using either monad

Lets refactor this method using monad

```jsx
const getPort = () => {
	try {
		const str = fs.readFileSync('config.json');
		const config = JSON.parse(str);
		return config.port;
	} catch (e) {
		return 3000;
	}
}
```

```jsx
const tryCatch = f => {
	try {
		return Right(f());
	} catch(e) {
		return Left(e);
	}
};

// refactoring the read file functionality so 
// no one has the ability to call without a try catch
const readFileSync = path => 
	tryCatch(() => fs.readFileSync(path));

const getPort = () => 
	readFileSync('config.json')
	.map(contents => JSON.parse(contents))
	.map(config => config.port)
	.fold(() => 8080, x => x);

const result = getPort()
```