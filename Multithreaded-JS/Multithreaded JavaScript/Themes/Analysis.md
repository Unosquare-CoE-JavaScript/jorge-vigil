# Analysis

In the big picture, the main reason to add web workers to an application is to increase performance (at the cost of added complexity). But how to identify situations deserving of threads?

# When not to use

Threading should often be used as a final effort to optimize performance. The following situations examine examples where threading does not add performance benefits.

## Low memory constraints

As analyzed previously, there’s additional memory overhead incurred when instantiating multiple threads in JS. The exact numbers of what consist of a sufficient environment to run threads is hard to calculate. Lets consider the following code.

```jsx
#!/usr/bin/env node

const { Worker } = require('worker_threads');
const count = Number(process.argv[2]) || 0;

for (let i = 0; i < count; i++) {
	new Worker(__dirname + '/worker.js');
}

console.log(`PID: ${process.pid}, ADD THREADS: ${count}`);
setTimeout(() => {}, 1 * 60 * 60 * 1000);
```

Then we can execute the program and measure the memory usage like so:

```jsx
# Terminal 1
$ node leader.js
# PID 10000

# Terminal 2
$ pstree 10000 -pa
$ ps -p 10000 -o pid,vsz,rss,pmem,comm,args
```

The `pstree` command displays the threads used by the program. It displays the main V8 JS thread, as well as some background threads. The ps command displays information about the process, specifically the memory usage. Some important variables measured with this command are: 

- `VSZ` (virtual memory size), the memory the process can access including swapped memory, allocated memory, and memory used by shared libraries.
- `RSS` (resident set size), the amount of physical memory currently being used by the process

Running the program with a numerical argument greater than 0 allows the program to create additional workers.

Its always recommended to run these tests in the desired environment. Another important thing to remember is that loading heavy frameworks and web servers in each thread may add up hundreds of megabytes of memory to the process. 

## Low core count

The application may run slower in situations where it has fewer cores. Even when employing a thread pool and scale it based on the core count, the application will be slower if it creates a single worker thread. We need to also consider the overhead caused by the message passing between threads.

On the Linux OS there’s a way of telling the OS that a program, and all of its threads, should only run on a subset of CPU cores. This could help developers to test the effects of running a multithreaded application in a low core environment.

Taking as an example the ch-6-thread-pool example, we can execute the app as follows:

```jsx
# Linux only
$ THREADS=2 STRATEGY=leastbusy taskset -c 0 node main.js
```

`taskset` command forces the process (and all its child threads) to use the same CPU core. The `-c 0` flag tells the command to only allow the program to use the 0th CPU. Then running benchmarks on this running program we may discover that the process has more performance when running in a single-core environment when compared to having access to all cores.

## Containers vs Threads

The rule of thumb when writing server software, is that processes should scale horizontally. Which means we should run multiple redundant versions of the program in an isolated manner. Horizontal scaling allows developers to fine-tune the performance of the whole fleet of apps.

Orchestrators such as Kubernetes, are tools that run containers across multiple servers. They make it easy to scale an application on demand; during holiday the developers can manually increase the number of instances running. They can also dynamically change the scale depening on CPU usage, traffic throughput and even the size of work queue.

# When to use

Here are some of the most straightforward characteristics of a problem that benefits from a multithreaded solution.

### Embarrasingly parallel

A large task can be broken down to smaller tasks and very little or no sharing of state is required. One example is the Game of life discussed earlier. In that case, the game grid can be subdivided into smaller grids, each having a dedicated thread.

### Heavy math

Heavy use of math, aka CPU-intensive work are another set of problems that benefit from threads. The opposite of a heavy math application is one that is I/O heavy, or deals mostly with network operations.

 

### MapReduce-friendly problems

Inspired in functional programming, this model of programming is often used for large scale data processing spread across many machines. `MapReduce` consists of two pieces. The Map accepts a list of values and produces a list of values. The Reduce, iterates on the list of values and produces a singular value. Here, multiple threads could process subset of the lists of data. A search engine uses Map to scan millions of documents for keywords, then Reduce to score and rank them. Hadoop and MongoDB benefit from `MapReduce`.

### Graphics processing

A lot of graphics processing may also benefit from multiple threads. In a similar manner to The Game of Life, images are represented as a grid of pixels. Image filtering then becomes a problem of subdividing an image into smaller images.

These are general situations where multithreading could result useful. Also problems that don’t require shared data, or at least don’t require coordinated reads and writes to shared data, are easier to model using threads.

Another use case is that of template rendering. Usually this is done with a string that represents the raw template and an object that contains variables to modify the template. Offloading template rendering from the main thread could gain performance.

<aside>
💡 The code in the ch8-template-render/ directory tests this assumption.

</aside>

This app simulates an HTTP application that performs basic HTML rendering when it receives a request. It can be run as follows:

```jsx
# Termial 1
$ node server.js

# Terminal 2
$ npx autocannon -d 60 http://localhost:3000/main
$ npx autocannon -d 60 http://localhost:3000/offload
```

When running these tests, rendering templates on the main thread takes way longer that offloading to a worker thread. In this example the application was made faster with the additional threads. Such changes and implementation need to be tested in the environment the application is going to run in, so we can take true advantage of multithreading.

# Summary of caveats

The following is a combined list of the aforementioned caveats when working with threads.

### Complexity

Applications tend to be more complex when using shared memory. Specially when having hand-writing calls with `Atomics` and manually working with `SharedBufferArray` instances. This complexity can somehow be hidden through the use of a third-party module.

### Memory overhead

There is additional memory overhead with each thread that is added to a program. This overhead is compounded if a lot of modules are being loaded in each thread. Is better to run tests on the end hardware the code will run on. Also audit the code being loaded in separate threads to prevent loading unnecessary libraries.

### No shared objects

Inability to share objects between threads make it difficult to convert a single-thread application to a multithreaded one. Instead, when mutating objects, we need to pass messages to mutate an object that lives in a single location.

### No DOM access

Only the main thread of a browser-based app has access to the DOM. This make it difficult to offload UI rendering tasks to another thread. But its possible to use the main thread for DOM mutation and having additional threads do all the heavy processing and return data changes to the main thread to update the UI.

### Modified APIs

There are slight changes to APIs available in threads. Also individual worker types have even more rules, like disallowing blocking `XMLHttpRequests#open()` requests, `localStorage` restrictions, top-level await, etc.

### Structured clone algorithm constraints

There are some restrictions that make it difficult to pass certain class instances between threads. Even if two threads have access to the same class definition, those instances can become plain Object instances when passed between threads.

### Browsers require special headers

When working with shared memory in the browser via `SharedArrayBuffer`, the server must supply two additional headers in the request for the HTML document used by the page. These can be difficult or even impossible to supply in certain environments.

### Thread preparedness detection

There’s no built in functionality to know when a thread is ready to work with shared memory. Instead, a possible solution is pinging the thread and then wait until a response has been received.