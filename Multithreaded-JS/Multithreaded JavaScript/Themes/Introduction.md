# Introduction

Until recently, the only mechanisms available for multitasking in JavaScript were splitting tasks up and scheduling their pieces for later execution, and in the case of Node.js, running additional processes. We’d typically break code up into asynchronous units using callbacks or promises.

```jsx
readFile(filename, (data) => {
  doSomethingWithData(data, (modifiedData) => {
    writeFile(modifiedData, () => {
      console.log('done');
		});
	});
});

// OR...

const data = await readFile(filename);
const modifiedData = await doSomethingWithData(data); await writeFile(filename);
console.log('done');
```

Today, all major JS enviroments we have access to threads, although with some tradeoffs in comparison with other languages like python (like not being able to share JS objects across threads). For example, in the browser there’s special-purpose threads that have feature sets available to them that are different from the main thread.

Right now, spawning a new thread and handling a message in a browser can be as simple as:

```jsx
const worker = new Worker('worker.js');
worker.postMessage('Hello world');

// worker.js
self.onmessage = (msg) => console.log(msg.data);
```

<aside>
⚠️ Not every problem needs to be solved with threads. Not every CPU-intensive problem needs to be solved with threads

</aside>

# Threads

> In all modern operating systems, all units of execution outside the kernel are organized into processes and threads
> 

Developers can use those, and communicate them between each other to add concurrency to a project. On multiple CPU core environments, this also means adding parallelism.

When a program is executed, a process is initiated. A program may spawn additional processes, which have their own memory space. These processes do not share memory and have their own instruction pointers, meaning each can execute a different instruction at the same time.

A process may spawn threads, which are like processes, except it shares memory space with the process it belongs to. Since they share memory space, processes can share program code and other values between threads. This makes them more valuable than processes for adding concurrency but at the cost of more programming complexity.

# Concurrency VS Parallelism

*Concurrency:* Tasks are run in overlapping time

*Parallelism:* Tasks are run at exactly the same time

Concurrency can be achieved without parallelism. For tasks to be running with parallelism, they must be running exactly at the same time. Which generally means they must run on separate CPU cores at exactly the same time.

Because of this is important to remember threads don’t automatically provide parallelism. Hardware must allow for this by having multiple CPU cores and the OS scheduler must decide to run the threads on separate ones.

As threads are typically added to a program to increase performance, if a system allows for concurrency due to only having a single CPU core, the benefits of concurrency are not perceived. In fact, the synchronization tasks and switch of context between threads may end up making the program perform even worse.

> Always measure the performance of the app under the conditions it’s expected to run in
> 

# Single-threaded JS

Historically, the platforms that JS ran on didn’t provide any thread support. JS doesn’t have any built in functionality to create threads. Even basic functions like `setTimeout` aren’t actually JS features, but provided by specific APIs provided by the virtual machine JS is embedded in, such as Node.js or browsers.

Instead of having threads as a concurrency primitive, most JS is written in an event-oriented manner on a single execution thread. Events like user IO trigger the execution of functions, typically called *callbacks,* which are the underlying primitive for async programming in JavaScript.

> Only one call stack is active at any given time
> 

# Hidden threads

While JS code may run in a single-thread environment, that doesn’t mean the process running the code is single threaded.

Modern JS engines like V8 use separate threads to handle garbage collection and other features. In Node.js `libuv` is an async IO interface which uses a pool of worker threads to avoid blocking program code when using otherwise blocking APIs, such as filesystem API. By default four of these threads are spawned, though the number can be configurable via the `UV_THREADPOOL_SIZE` env variable, up to 1024.

Browsers similarly perform many tasks, such as DOM rendering, in threads other than the one used for JS execution.

Its important to think about the extra threads generated when planing the resources for an application. Never assume that just because JS is single-threaded that only one thread will be used for the entire app.