# Advanced Shared Memory

`SharedArrayBuffer` offers a way to read and write directly to a collection of shared data from across separate threads. But this is risky since one thread could clobber data written by another thread.

Now using the `Atomics` object allows to perform basic operations with that data preventing clobbering. But the need arise to perform more complex interactions with the data. For example, once the data has been serialized, that data needs to be written to the `SharedArrayBuffer` instance. None of the existing `Atomics` methods will allow to set the entire value all at once.

# Atomic methods for coordination

Different from the previous Atomic methods for data manipulation, these methods only work with `Int32Array` and `BigInt64Array` instances, and they only make sense when used with `SharedArrayBuffer` instances. These methods are modeled after a Linux feature called the futex (fast userspace mutex). A futex is built upon two basic operations, “wait” and “wake”.

## Atomics.wait()

```jsx
status = Atomics.wait(typedArray, index, value, timeout = Infinity)
```

Checks `typedArray` to see if the `value` at `index` is equal to `value`. If not, returns the value `not-equal`. If it is, it will freeze the thread for up to `timeout` milliseconds. If nothing happens during that time, the function returns the value `timed-out`. Now, if another thread calls `Atomics.notify()` for that same `index` within the time period, the function returns `ok`.

| Value | Description |
| --- | --- |
| not-equal | Provided value didn’t equal the value present in the buffer |
| timed-out | No calls to Atomics.nofity() from other threads within the allotted timeout.  |
| ok | No calls in time to Atomics.notify() |

Since its better to return a simple string instead of instantiate `Error` objects and generate stack traces, this method doesn’t throw any errors for the first two conditions and silently succeed instead of returning an ok. This way is more performant and translates into a more fast app. 

The locking behavior of threads prevents any other calls to be executed. Such is the way `alert()` function works. The browser displays a dialog and nothing can run, not even in background tasks using the event loop, until the dialog is dismissed. The `Atomics.wait()` method, similarly freezes the thread.

The blocking mechanism is so extreme that the main thread is not allowed to call this method, since it’ll produce such a poor user experience. At least that’s the case for a web browser. Node.js on the other  hand, allows this function to be called in the main thread. It can be useful when calling `fs.readFileSync()`.

## Atomics.notify()

```jsx
awaken = Atomics.notify(typedArray, index, count = Infinity)
```

Attempts to awaken other threads that have called `Atomics.wait()` on the same `typedArray` and at the same index. If any other threads are currently frozen, then they will wake up. Count value which defaults to infinity determines how many of the will be awaken. Infinity value means every thread will be awakened.

The return value is the number of threads that have been awoken once the method is complete. When passing in a `TypedArray` instance that points to a nonshared `ArrayBuffer` instance, this will always return a 0. If no threads are listening at the time it will also return a 0. This method doesn’t lock the thread, so it can be called from a main thread.

## Atomics.waitAsync()

```jsx
promise = Atomics.waitAsync(typedArray, index, value, timeout = Infinity)
```

A promise-based version of `Atomics.wait()`. A less performant, non-blocking version of `Atomics.wait()` that returns a promise which resolves the status of the wait operation. Not recommended for the hotpath of a CPU-heavy algorithm. But useful in situations where a lock change is more convenient to signal another thread than to perform message-passing operations via `postMessage()`. Since this method doesn’t block the thread, it can be used in the main thread of an application.

# Timing and Nondeterminism

A functioning application needs to behave in a deterministic fashion. The `Atomics.notify()` function wakes threads but doesn’t define which threads to woken up and in which order.

## Example of nondeterminism

Threads are woken up in FIFO order, which means the first thread that called `Atomics.wait()` is the first to be woken up, the second to call is the second to be woken up, and so  on. Since such an application is hard to debug, it should be built in such a way that it continues to work fine regardless of the order in which threads are waken.

<aside>
💡 To test this check the example at ch5-notify-order/

</aside>

Main.js creates a 4-byte buffer, then creates four different dedicated workers using a for loop. For each worker it calls the `postmessage()` method to pass in both the buffer as well as the identifier for the thread. 

These threads are created in a non deterministic way, since the amount of time it takes to execute all the creation tasks is variable from run to run. After creation, the main thread finishes its work and waits 500ms before calling `Atomics.notify()`. It has to be a high time value because if its too short, some of the threads may not be ready and the worker wouldn’t have time to call `Atomics.wait()`, and the call would return immediately with a 0.

The worker accepts shared buffer and the name of the worker thread and stores the values, printing a message that the thread has been initialized. It then calls `Atomics.wait()` using the 0th index of the buffer. Finally, once the method call is complete, the value is printed in the terminal.

After running, the most likely is the final worker name that is printed with the “started” message will also be the worker that fails with the “timed-out” message.

## Detecting thread preparedness

The question rises: how can an app deterministically know when a thread has finished going through initial setup and is prepared to take work?

A simple way to do so is to call `postMessage()` from within the worker threads to post back to the parent thread at some point during the `onmessage()` handler. This works because once the `onmessage()` handler has been called the worker thread has finished its initial setup and is now running JS code.

<aside>
💡 Check ch5-notify-when-ready for an example of this

</aside>

`Atomics.notify()` will be called after each of the four workers has posted a message back to the main thread. Once the final worker has posted a message, the notification is sent. This method has also been updated to simply wake up all threads.

`onmessage` handler immediately calls `postMesage()` to send a message back to the parent. Then, the wait call happens shortly afterward. One thing to consider is that calling `Atomics.wait()` will pause the thread, which means `postMessage()` cannot be called afterwards.

# Example application: Conway’s game of life

Conway’s game of life is a simulation of population growth and decay. The world is represented as a grid of cells that have one of two states: alive or dead. The simulation works iteratively, and on each iteration, the following instructions are performed for each cell.

1. If the cells is alive:
    1. If there are 2 or 3 neighbors alive, the cell remains alive
    2. If there are 0 or 1 neighbors alive the cell dies
    3. If there are 4 or more neighbors alive, the cell dies
2. If the cell is dead:
    1. If there are exactly 3 neighbors alive, the cell becomes alive
    2. In any other case, the cell remains dead.

The “neighbors” are any cell that’s at most one unit away from the current cell, including diagonals.

## Single-threaded game of life

We have a Grid class which holds our Game of Life as an array.

<aside>
💡 The functioning example can be found in the ch5-game-of-life directory

</aside>

# Atomics and Events

The event loop allows JS to create new call stacks and handle events. But when introducing the `Atomics.wait()` and shared memory, which allows applications to halt the execution, it causes the event loop to completely stop working. Certain restrictions must be followed for the application to run without problems.

The first one is: the main thread of the app should not call `Atomics.wait()`. For example, if the main Node thread is handling HTTP requests, or is handling OS signals, whats going to happen when the event loop comes to a halt when an operation is started?

<aside>
💡 check ch5-node-block/main.js for an example of this

</aside>

We can run this with

```jsx
$ node main.js
```

Once running we call the following command several times with a random amount of time between calls to see the effect of the wait call.

```jsx
$ time curl http:localhost:1337
```

This app creates an HTTP server and listens for requests. Then, every two seconds a call to `Atomics.wait()` is made so it freezes for 1.9 seconds to exaggerate the effect of long pauses. The output of the time expend for the command to be executed will vary between 0 and 1.9 seconds.

So we can see, if web browsers allowed `Atomics.wait()` calls in the main thread, we’ll encounter micro stutters like this in the websites we visit every day.

Another recommendation about restrictions is to designate ahead of time what the main purpose of each spawned thread is. Each one either becomes a CPU-heavy thread that makes heavy use of `Atomics` calls or an event-heavy thread with minimal `Atomics` calls. In this approach we might have a worker thread that’s performing complex calculations and writing the results to a shared array buffer. Then we also have the main thread, which will communicate via message passing and doing event loop based work. Then it might make sense to have simple intermediary threads that call `Atomics.wait()` as they wait for another thread to finish doing work, then call `postMessage()` to send the resulting data back to the main thread.