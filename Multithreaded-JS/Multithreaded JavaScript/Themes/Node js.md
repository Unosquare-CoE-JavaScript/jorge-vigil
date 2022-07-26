# Node.js

Outside browsers Node.js is the only JS runtime of note. It started as a platform for single-threaded concurrency in servers with continuation-passing style callbacks, but now is mainly used as a general-purpose programming platform.

Most of Node.js programs are command-line tools acting as build systems for JS. Such programs are typically heavy I/O operations, but with a lot of data processing. I.e tools like Babel and Typescript  transform code from one language to another. Tools like Webpack, Rollup, and Parcel bundle and minify code for distribution to the web frontend where load times are crucial. In situations like these, while there’s a lot of I/O going on, there’s also a lot of data processing which is generally done synchronously. In these situations parallelism might get the job done quicker.

Parallelism can also be useful in Node.js servers, where data processing happens a lot for example during `server side rendering` (SSR) which involves a lot of string manipulation where the source data is already known.

# Before threads

Prior to threads in Node.js to take advantage of multiple CPU cores we had to use processes. They don’t provide the same benefits as threads, but if shared memory isn’t important then processes solve these problems easily.

A common case is having threads responding to HTTP requests sent to them from a main thread, which is listening on a port. We can also use processes to achieve a similar effect.

It might look something like this:

![Processes as they might be used in an HTTP server](Node%20js%20af0fb039274d4072b0407b5085020a7f/Untitled.png)

Processes as they might be used in an HTTP server

We could achieve something like this using the `child_process` API in Node.js but `cluster` was purpose-built for this use case. This module’s purpose is to spread network traffic across several processes.

The following hello world example is a standard HTTP serve in Node.js. It responds to any request regardless of path or method with “Hello, World!”.

```jsx
const http = require('http');

http.createServer((req, res) => {
	res.end('Hello, World!\n')
}).listen(3000);
```

Now we add four processes with cluster. The common approach is to use an `if` block to detect whether we’re in the main listening process or one of the worker processes. If we’re in the main process, then we have to spawn the worker processes. Otherwise, we just set up an ordinary web server as before in each of the workers.

```jsx
const http = require('http');
const cluster = require('cluster');

if (cluster.isPrimary) {
	cluster.fork();
	cluster.fork();
	cluster.fork();
	cluster.fork();
} else {
	http.createServer((req, res) => {
		res.end('Hello, World!\n');
	}).listen(3000);
}
```

Important to notice that, event thought it seems we’re listening four times in the same port, cluster manages in such a way any call to listen() will actually cause Node.js to listen on the primary process rather than on the worker. Then, once a connection is received in the primary process, it’s handed over to a worker process via IPC. This is how each worker can appear to be listening on the same port, when in fact it’s just the primary process listening on that port and passing connections off to all the workers.

Now, processes incur some extra overhead that threads don’t, also shared memory is absent from processes. For that we need the `worker_threads` module.

# The worker_threads module

This built-in module offers support for threads and provides an interface that mimics a lot of what’s found in browsers for web workers.

Main differences between main thread in browsers and in Node.js

- Using `process.exit()` will just exit the thread instead of the program.
- `process.chdir()` function for changing directories is not available
- `process.on()` cannot be used to handle signals

To create a new worker thread we can use the Worker constructor.

```jsx
const { Worker } = require('worker_threads');

const worker = new Worker('worker-filename.js');
```

## workerData

The Worker constructor takes arguments, second of which is an options object, that allows to specify a set of data to be passed to the worker thread. The options object property is called workerData. Inside the thread we can access the cloned data via the workerData property of the worker_threads module.

```jsx
const {
	Worker,
	isMainThread,
	workerData
} = require('worker_threads');

const assert = require('assert');

if (isMainThread) {
	const worker = new Worker(__filename, { workerData: { num: 42 } });
} else {
	assert.strictEqual(workerData.num, 42);
}
```

Important to note that the properties of the `workerData` object are cloned rather than shared between threads. Any changes made in an object will not be visible in the other thread. But we can have shared memory between threads via `SharedArrayBuffer`. These can be shared via `workerData` or by being sent through a `MessagePort`.

## MessagePort

A `messagePort` is on end of a two-way data stream. By default, one is provided to every worker thread to provide a communication channel to and from the main thread. It’s available in the worker thread as the `parentPort` property of the `worker_threads` module.

Call the `postMessage()` to send a message via the port. The first argument is any object that can be passed, which is the message data being passed to the other end of the port. When a message is received on the port, the `message` event is fired, with the message data being the first argument to the event handler function. In the main thread, the event and the `postMessage()` method are on the worker instance itself, rather than having to get them from a `MessagePort` instance.

```jsx
const {
	Worker,
	isMainThread,
	parentPort
} = require('worker_threads');

if (isMainThread) {
	const worker = new Worker(__filename);
	worker.on('message', msg => {
		worker.postMessage(msg);
	});
} else {
	parent.on('message', msg => {
		console.log('We got a message from the main thread: ', msg);
	});
	parentPort.postMessage('Hello, World!');
}
```

We can also create a pair of `MessagePort` instances connected to each other via the `MessageChannel` constructor. Then pass one of the ports via an existing message port or via `workerData`. This might convenient when neither of two threads that need to communicate are the main one. The following example is the same as previous, except using ports created via `MessageChannel` and passed via `workerData`.

```jsx
const {
	Worker,
	isMainThread,
	MessageChannel,
	workerData
} = require('worker_threads');

if (isMainThread) {
	const { port1, port2 } = new MessageChannel();
	const worker = new Worker(__filename, {
		workerData: {
			port: port2
		},
		transferList: [port2]
	});
	port1.on('message', msg => {
		port1.postMessage(msg);
	});
} else {
	const { port } = workerData;
	port.on('message', msg => {
		console.log('We got a message from the main thread: ', msg);
	});
	port.postMessage('Hello, World!');
}
```

Notice the `transferList` option when instantiating the Worker. This transfers ownership of objects from one thread to another. It is required when sending any `MessagePort`, `ArrayBuffer`, or `FileHandle` objects via `workerData` or `postMessage`. Once transferred, these objects cannot be used on the sending side.

# Worker Pools with Piscina

Most tasks that require the use of one or more threads are generally making use of a lot of math or synchronous data processing. These operations involve submitting a single task to a thread and waiting for a result from it. A pool of workers can be maintained to sent various tasks from the main thread.

For the use case of discrete tasks sent to a pool of worker threads, [piscina](https://oreil.ly/0p8zi) module is at our disposal. This module encapsulates the work of setting up bunch o worker threads and allocating tasks to them.

For the usage: first create an instance of the `Piscina` class, passing in a filename to be used in the worker thread. Behind the scenes, a pool of worker threads is created and a queue is set up to handle incoming tasks. Enqueue a task by calling `.run()`, passing in a value with all the data necessary to complete this task.

<aside>
💡 Nothing in the value passed to `.run()` will be cloned as it would happen with `postMessage()`

</aside>

This returns a promise that resolves once the tasks have been completed by a worker. In the file to be run in the worker, a function must be exported that takes in whatever is passed to `.run()` and returns the result value. This can be an async function, so that you can do asynchronous tasks in a worker thread if needed. The following example calculates square roots in worker threads.

```jsx
const Piscina = require('piscina');

if (!Piscina.isWorkerThread) {
	const piscina = new Piscina({ filename: __filename });
	piscina.run(9).then(squareRootOfNine => {
		console.log('The square root of nine is', squareRootOfNine);
	});
}

module.exports = num => Math.sqrt(num);
```

A better example is to actually run several tasks in the pool. Let’s calculate the square roots of every number lees than ten million.

```jsx
const Piscina = require('piscina')
const assert = require('assert')

if (!Piscina.isWorkerThread) {
	const piscina = new Piscina({ filename: __filename });
	for (let i = 0; i < 10_000_000; i++) {
		piscina.run(i).then(squareRootOfI => {
			assert.ok(typeof squareRootOfI === 'number');
		});
	}
}

module.exports = num => Math.sqrt(num);
```

The previous code will fall into an allocation error. To avoid this, we need to set a limit. The `piscina` module allows to set a limit by using a `maxQueue` option in its constructor. An ideal `maxQueue` value is the square of the number of worker threads it’s using. Setting `maxQueue` to auto already does that.

Then we need to handle the bound when the queue is full. There are two ways to detect that the queue is full.

1. Compare the values of `piscina.queueSize` and `piscina.options.maxQueue`. Make the comparison before calling `.run()` to avoid attempting to enqueue when it’s full. This is the recommended way.
2. If `piscina.run()` is called when the queue is full, the returned promise will reject with an error indicating this. This isn’t ideal because at this point other attempts to enqueue may already have happened.

When the queue is full, we need a way of knowing when it’ll be ready for new tasks again. Piscina pools emit a `drain` event once the queue is empty.

```jsx
const Piscina = require('piscina');
const assert = require('assert');
const { once } = require('events');

if (!Piscina.isWorkerThread) {
	const piscina = new Piscina({
		filename: __filename,
		maxQueue: 'auto'
	});
	(async () => {
		for (let i = 0; i < 10_000_000; i++) {
			if (piscina.queueSize === piscina.options.maxQueue) {
				await once(piscina, 'drain');
			}
			piscina.run(i).then(squareRootOfI => {
				assert.ok(typeof squareRootOfI === 'number');
			});
		}
	})();
}

module.exports = num => Math.sqrt(num);
```