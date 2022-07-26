# Multithreaded patterns

As saw before, the purpose of the SharedArrayBuffer is to store a raw, binary representation of data. Then with the Atomics object we have rather primitive methods for coordinating or modifying a handful of bytes at a time.

These lower level abstraction APIs can make difficult to understand the usefulness of these concepts. So this chapter contains popular design patterns for implementing multithreaded functionality inside an application.

# Thread pool

Very popular pattern that is used in most multithreaded applications in some form or another. A *thread pool* is a collection of homogeneous worker threads that are each capable of carrying out CPU-intensive tasks.

Similar to distributed systems, in which a container orquestration platform has a collection of machines, each capable of running application containers. Each machine might have different capabilities, such as running different operating systems or having different memory and CPU. In these cases, the orchestrator may assign points to each machine based on resources and apps, then consume said points. On the other hand, a thread pool is much simpler since each worker is capable of carrying the same work the same as each thread since they’re all running on the same machine.

## Pool size

There are two types of programs: those running in the background, which ideally shouldn’t consume many resources, and programs that run in the foreground, like a desktop app. The intent with a JS application is often to be the main focus at a particular point in time.

To execute instructions as quickly as possible, it makes sense to break them up and run them in parallel. To maximize CPU usage it figures that each of the cores should be used as equally as possible by the application. So the number of cores a CPU has available should be a determining factor for the number of threads, or workers, an application should use.

Typically the size of a thread pool won’t need to dynamically change throughout the lifetime of the app. Then is the most common practice to work with a thread pool with a fixed size, dynamically chosen when the application launches.

A simple approach for getting the number of threads available to the JS app currently running, depending on whether the code runs in a browser or a Node process:

```jsx
// browser
cores = navigator.hardwareConcurrency;

// Node.js
cores = require('os').cpus().length;
```

One thing to keep in mind is that with most OS there is not a direct correlation between a thread and a CPU core. Usually the OS moves tasks around cores, occasionally interrupting a running program to handle another application.

Each time a CPU core switches focus between programs - or threads in a program - a small context shift overhead comes into play. Because of this, having too many threads compared to the number of CPU cores can cause a loss of performance. That constant context switching will make an application slower. However, too few threads can represent extended execution times for applications, resulting in poor user experience or wasted hardware.

<aside>
💡 Keep in mind the characteristics of the app when tweaking for a perfect pool size. I.e an app that uses most of each threads and almost to none I/O operations could benefit from having a pool size equal to the number of cores available. Another app that needs to perform heavy CPU processes and heavy I/O could use the available number of cores, minus two. A general rule of thumb is to use the number of available cores minus one, and tweak from there.

</aside>

## Dispatch strategies

As a thread pool is a technique intended to maximize the work done in parallel, its reasonable to think no worker should get much work to handle and no threads should be sitting idle. A few strategies are often employed by apps to dispatch tasks to workers in a worker pool:

### Round robin

Each task is given to the next worker in the pool, wrapping around to the beginning once the end has been hit. The benefit of this approach is that each thread gets the same number of tasks to perform. The drawback is that if the complexities of each task is a multiple of the number of threads, there will be an unfair distribution of work.

### Random

Each task is assigned to a random worker in the pool. Although this is the simplest to implement, this could also mean some times the workers are given too much work to perform and sometimes will be given too little.

### Least busy

A count of the number of tasks being performed by each worker is maintained, and when a new task comes along it is given to the least busy worker. When two workers have a tie for the least amount of work, then one can be chosen randomly. This is the most robust approach but also the most complex to implement.

Other strategies employed by reverse proxies might have other implementations. i.e HAProxy has a strategy for load balancing called source, which takes a hash of the client’s IP address and uses that to consistently route requests to a single backend. An equivalent to this might be useful i cases where worker threads maintain an in-memory cache of data and routing related tasks to the same worker could result in more cache hits.

<aside>
💡 Depending on the app, one can find that one of these approaches performs better than the rest. Use benchmarking to measure the application performance

</aside>

## Example implementation

<aside>
💡 Check the code in the directory ch6-thread-pool

</aside>

This application exposes a web server and every request then creates a new task for the thread pool. Previous tasks might have been completed by the time the pool is consulted.

The server can be run with the following command:

```jsx
$ THREADS=3 STRATEGY=random node main.js
```

Where the number of threads, the strategy (either random, roundrobin or leastbusy) can be specified.

We can also run the `autocannon` command, which is an npm package to perform benchmarks. Although in this case, we’re not actually running benchmarks but just a bunch of queries. The command can be executed as follow:

```jsx
$ npx autocannon -c 5 -a 20 http://localhost:1337
```

This will open 5 connections at a time and send a total of 20 requests. This is akin to a production web server we could build.

# Mutex: A basic look

A mutually exclusive lock is a mechanism for controlling access to some shared data. It ensures that only one task may use that resource at any given time. A task acquires the lock in order to run code that access the shared data, and then releases the lock once it’s done. The code between the acquisition and the release its called the *critical section*. If a task attempts to acquire the lock while another task has it, that task will be blocked until the other task releases the lock.

It may seem redundant when already having atomic operations. But code often requires data not to be modified externally across more than one operation. The units of atomicity provided by atomic operations are too small for many algorithms’ critical sections.

The following example initializes a buffer with a bunch of numbers and performs some basic math on them in several threads. Each thread will grab a value at a unique index per thread, then grab a value from a shared index, multiply them and write them at the shared index.  Then we’ll read from that shared index and check that it’s equal to the product of the previous two reads.

<aside>
💡 Code can be found in the ch6-mutex directory

</aside>

This is an example of race condition. All the threads are reading and writing concurrently (though not in parallel, since the operations themselves are atomic), so the results aren’t deterministic for a given input.

The next example solves this implementing a Mutex class using the primitives in `Atomics`. Using the `Atomics.wait()` to wait until the lock can be acquired, and `Atomics.notify()` to notify threads that the lock has been released. Then use `Atomics.compareExchange()` to swap the locked/unlocked state and determine whether we need to wait to get the lock.

<aside>
💡 The element in the shared array used to represent the state of being locked or unlocked is a trivial example of a semaphore. Semaphores are variables used to convey state information between threads. They indicate a count of a resource being used.

</aside>

# Streaming Data with Ring Buffers

Some applications may need to break data into chunks for transmission. Streaming data in applications may be used to transfer large amounts of data between computation units, like processes or threads.

A ring buffer is an implementation of a FIFO queue, implemented using a pair of indices into an array of data in memory. When data is inserted into the queue, it wont move to another spot in memory. Instead, we move the indices around as data gets added to or removed from the queue. The array is treated as if one end is connected to the other, creating a ring of data. Which means if these indices are incremented past the end of the array, they’ll go back to the beginning.

To implementing this, we’ll need two indices, head and tail. The head refers to the next position to add data into the queue, and the tail refers to the next position to read data out of the queue from. When data is written to or read from the queue, we increase the head or tail index, by the amount of data written or read, modulo the size of the buffer.

![Untitled](Multithreaded%20patterns%20e16c0769cb1c444583dcdf2533f42b86/Untitled.png)

This image visualizes how a ring buffer works using a ring with a 16-byte buffer. The first one contains 4 bytes of data, starting at 0 and ending at 3. Once four bytes of data are added to the buffer, the head marker moves forward four bytes to byte 8. In the final diagram, the first four bytes have been read, so the tail moves to byte 4.

<aside>
💡 Check the code at ch6-ring-buffer directory

</aside>

# Actor Model

Programming pattern for performing concurrent computation. The actor is a primitive container that allows for executing code, capable of running logic, creating more actors, and communicating with other actors.

The actor model is designed to allow computations to run in a highly parallelized manner without worrying about where the code is running or even the protocol used to implement the communication. The next figure shows how actors can be spread out across processes and machines.

![Untitled](Multithreaded%20patterns%20e16c0769cb1c444583dcdf2533f42b86/Untitled%201.png)

## Pattern nuances

Actors are able to process each message, or task that they receive one at a time. When messages are received, they stay in a message queue, sometimes called mailbox. No actors can write to the same piece of shared memory, but they are free to mutate their own memory. I.e an actor could keep count of the number of messages it has processed, and then deliver that data in messages that it later outputs.

Because there’s no shared memory involved, this model avoids some troubles previously mentioned, such as race conditions and deadlocks.

Often implemented in a single threaded fashion. A single actor is only able to process one task at a time, but different actors are free to run code in parallel.

## Relating to JS

Since actors don’t need to be limited to a single machine, processes can be run on multiple machines and communicate over the network. This can be replicated using Node processes and communicating using JSON via TCP protocol.

Actors require a message queue so that while one message is being processes another message can wait until the actor is ready. This can be implemented using the `postMessage()` method. Messages delivered in this manner wait until the current JS stack is complete before grabbing the next message.

<aside>
💡 Check ch6-actors for a working implementation

</aside>

![Untitled](Multithreaded%20patterns%20e16c0769cb1c444583dcdf2533f42b86/Untitled%202.png)

This image is a visualization of the implementation built in the example code

With this previous example, we have a way of dynamically increase the count of actors available for the application.

With the actor pattern we can think of the workers not as external APIs, but as extensions of the program itself.