# Browsers

JavaScript has many different implementations. The JS engine is different depending on each browser, like V8 in chrome, SpiderMonkey in Firefox, and JavaScriptCore in Safari.

These separated implementations each start by implementing some facsimile of the ECMAScript specification. Not every engine implements JavaScript in the same way. That’s why compatibility charts need to be consulted.

Other APIs are also added in each implementation to make the JS that can be run even more powerful. This chapter focuses on the multithreaded APIs provided by modern web browsers, the most approachable of which is the web worker.

# Dedicated workers

Web workers allow you to spawn a new environment for executing JS in. Code executed this way is allowed to run in a separate thread from the code that spawned it. Communication occurs by using a pattern called *message passing*.

A JS environment can spawn more than one web worker and every web worker can spawn more web workers. The simplest type of we worker is the dedicated worker.

## Dedicated worker Hello World

```jsx
// main.js
const worker = new Worker('worker.js');

worker.onmessage = msg => {
  console.log('message received from worker', msg.data);
};

worker.postMessage('message sent to worker');

// worker.js
console.log('hello from worker.js');

self.onmessage = (msg) => {
	console.log('message from main', msg.data);
  postMessage('message sent from worker');
};
```

First a new dedicated worker gets instantiated with the `new` keyword. Next a handler for the message event is attached to the worker with the `onmessage` property. When a message is received, that function gets called. The argument provided to the function is an instance of `MessageEvent`. The most relevant property of that object is the `.data`, which represents the object that was returned from the dedicated worker.

The JS environment communicates with every dedicated worker with its s `postMessage` method.

Then in the `worker.js` file there’s a single global function named `onmessage` and a function is assigned to it. This onmessage function is called when the worker.postMessage method is called from the outside.

<aside>
⚠️ using `const onmessage`, `let onmessage` or `function message` won’t work

</aside>

The filed loaded when creating a worker must be in the same origin the main JavaScript environment is running in.

## Advanced dedicated worker usage

JS that doesn’t involve dedicated workers has all its code available in the same realm. Loading new code is done by loading a script with a `<script>` tag or by making a XHR request and calling the `eval` function. When it comes to dedicated workers you can’t inject a `<script>` tag into the DOM because there’s no DOM associated with the worker.

Instead we have the `importScripts` function, which is a global function only available within web workers. This function accepts the paths to scripts to be loaded from the same origin as the web page. This function is called in a synchronous manner.

Instances of Worker inherit from EventTarget and have some generic methods for dealing with events. However, the Worker class provides the most important methods on the instance.

| Method | Description |
| --- | --- |
| worker.postMessage(msg) | Sends a message to the worker that is handled by the event loop before invoking the self.onmessage function, passing in msg |
| worker.onmessage | If assigned, it’s in turn invoked when the self.postMessage function inside the worker is called |
| worker.onerror | If assigned, it’s invoked when as error is thrown inside the worker. A single ErrorEvent argument is provided, having .colno, .lineno, .filename, and .message properties. This error will bubble up unless you call err.preventDefault |
| worker.onmessageerror | Invoked when the worker receives a message that cannot deserialize |
| worker.terminate() | If called, the worker terminates immediately. Future calls to worker.postMessage() will silently fail. |

In the dedicated worker, the global self variable is an instance of `WorkerGlobalScope`. Some high level communication APIs like XMLHttpRequest, WebSocket, and fetch are available.

The dedicated worker instance offers an optional argument for specifying its options:

```jsx
const worker = new Worker(filename, options)
```

The options argument is an object that can contain the properties:

- type: Either classic (default), for a classic JS file, or module to specify an ECMAScript Module (ESM)
- credentials: Determines if HTTP credentials are sent with the request to get the worker file. The value can be `omit` to exclude the credentials, `same-origin` to send credentials (but only if the origin matches), or `include` to always send the credentials.
- name: Names the dedicated worker and is mostly used for debugging.

# Shared workers

A type of web worker that can be accessed by different browser environments, like different windows (tabs), across iframes, and even from different web workers. They also have a different self within the worker, being an instance of sharedWorkerGlobalScope. A shared worker can only be accessed by JS running on the same origin.

<aside>
⚠️ Shared workers are currently disabled in safari

</aside>

One thing that makes shared workers difficult to reason about is that they aren’t attached to a particular environment. They’re initially spawned by a particular window, but after that they can end up “belonging” to multiple windows. That means when the first window is closed, the shared worker is kept around.

### Debugging shared workers

Firefox and chrome offer a dedicated way to debug shared workers. 

**Firefox**

Visit *about:debugging,* click This Firefox in the left column. Then scroll down to the shared workers section with a list of shared worker scripts.

**Chrome**

Visit *chrome://inspect/#workers* find the shared worker script entry and click “inspect”

Both browsers will open a dedicated console attached to the worker.

Shared workers can be used to hold a semi persistent state that is maintained when the other windows connect to it. That state is hold until the last window that is using the worker is refreshed or closed.

## Shared worker hello world

A shared worker is “keyed” based on its location in the current origin. In this example the shared worker is located in *http://localhost:5000/shared-worker.js*. Whether the worker is loaded from an HTML file in */red.html*, */blue.html* or */foo/index.html*, the shared worker instance will always remain the same.

![Untitled](Browsers%202858a466f2f7456e9c1e8267cf8766f5/Untitled.png)

<aside>
💡 Check the ch2-shared-workers folder for the shared workers working example

</aside>

## Advanced shared worker usage

Like their dedicated workers counterpart, shared workers have access to `importScripts()` function for loading external JS.

The shared worker instances have access to a connect event, which can be handled with the `self.onconnect()` method. A `disconnect` or `close` event are missing from the implementation.

The singleton collection of port instances in the example can easily create memory leaks. To prevent that we can add an event listener in the main JS environment that fires when the instance of the page is destroyed. Have this listener pass a special message to the shared worker. When the message is received, remove the port from the list in the shared worker.

```jsx
// main js
window.addEventListener('beforeunload', () => {
	worker.port.postMessage('close');
});

// shared worker
port.onmessage = event => {
	if (event.data === 'close') {
		ports.delete(port);
		return;
	}
}
```

Unfortunately, this doesn’t cover all the cases. If the beforeunload event doesn’t fire, or an error happens when it’s fired, or if the page crashes, this can lead to a port reference remaining in the shared worker.

A solution for this would involve having the shared worker “ping” the calling environments, sending a message via `port.postMessage()`, and have the calling environments reply. So the shared worker can delete port instances if it doesn’t receive a reply.

# Service workers

A service worker functions as a sort of proxy between one or more web pages running in the browser and the server. Potentially associated with multiple pages instead of just one, so its more similar to shared workers than dedicated workers. The main difference is a service worker can run even if the page isn’t open. But it requires a web page to be opened first to install.

| Worker Type | # of pages it requires to exist |
| --- | --- |
| Dedicated | One page |
| Shared | One or more |
| Service | Zero or more |

Mainly intended for cache management of a website or a single web application.

Can’t access the DOM. Can’t make blocking requests. Browsers only allow service workers to run on a web page served with HTTPS protocol. Service workers aren’t allowed in incognito or private windows. A service worker instance can’t communicate between a normal and Incognito window.

### Debugging service workers

**Firefox**

Visit *about:debugging#/runtime/this-firefox.* Scroll down to the service workers section.

**Chrome**

There are two different screens available for accessing the service workers

The more robust is located at *chrome://serviceworker-internals/*. It contains a listing of service workers, their status, and basic log output.

The other is at *chrome://inspect/#service- workers*. With a lot less info.

## Service worker Hello World

A basic service worker that intercepts all HTTP requests sent from a basic web page. Requests made to a specific resource will return a value calculated by the service worker itself.

<aside>
💡 Check the ch2-service-workers folder for the working example

</aside>

Notice the code depends on the `navigator.serviceWorker` object to create the worker. The `scope` represents the directory for the current origin wherein any HTML pages that are loaded in it will have their requests passed through the service worker. By default, the `scope` value is the same as the directory that the service worker is loaded from.

## Advanced service worker concepts

Service workers are meant to perform asynchronous operations only. Thus, `localStorage` API, which blocks when reading and writing isn’t available. However the async `indexedDB` API is available. Top-level `await` is disabled.

Storing state in a global variable is not reliable. Stopping and restarting the worker flushes out global state.

When reloading the page, the browser may request for the script, but unless the script has changed wont be considered for reloading.

<aside>
💡 Chrome offers the ability to trigger the script update when reloading the page. In the Application tab in the inspector click “Service Workers”, then check “Update on reload”.

</aside>

The service workers go through a state change from the time of its inception until the time it can be used. This state is available in the property `self.serviceWorker.state`.

### States service workers go through

*parsed*

The very first step of the service worker. At this point the JS content has been parsed.

*installing*

Installation begun but not yet completed. Happens once per worker version. This state is active after `oninstall` is called and before the `event.respondWith()` promise has resolved.

*installed*

The installation is complete. `onactivate` handler is about to be called.

*activating*

When `onactivate` is called but `event.respondWith()` hasn’t yet resolved.

activated

The activation is complete and the worker is ready. At this point `fetch` events will be intercepted.

*redundant*

A newer version of the script has been loaded, and the previous script is no longer necessary. Also triggered if the worker script download fails, contains a syntax error, or if an error is thrown.

Service workers philosophy is that they should be a form of progressive enhancement. Which means any web pages using them should still behave as usual if the service worker isn’t there. This is because there could be browsers that don’t support service workers, or the installation phase could fail, or the user customization could restrict them entirely.

The global `self` object inside service workers is an instance of `ServiceWorkerGlobalScope`. The `importScripts()` function in other web workers is available in this environment as well. There’s also possible to pass messages into and receive messages from a service worker. `self.onmessage` handler can be assigned.

Service workers can implement caches that can be controlled programmatically, and the browser itself deals with regular network caching. This means requests sent from service workers to the server might not always be received by the server. Keep `Cache-Control` and `Expires` headers in mind, and be sure to set intentional values.

<aside>
💡 Mozilla put together a cookbook full of common strategies when building out service workers. Check it out at [https://serviceworke.rs/](https://serviceworke.rs/)

</aside>

# Message Passing Abstractions

These examples expose interfaces for passing messages into and receiving messages from a separate JS environment. This allows to build apps capable of running JS simultaneously across multiple cores.

But when building larger applications its important to pass messages along that can scale and run code in workers that can scale, and simplifying the interface when working with workers will reduce potential errors.

## RPC Pattern

Previous examples had only worked using strings, but what if we need to pass along more arguments like numbers?

The RPC (Remote Procedural Call) pattern is a way to take a representation of a function and its arguments, serialize them, and pass them to a remote destination to execute them.

There’s a complexity issue that an application needs to worry about. If multiple messages are sent to a web worker at the same time, there’s no easy way to correlate the responses. 

```jsx
worker.postMessage('square_sum|num:4');
worker.postMessage('fibonacci|num:33');

worker.onmessage = (result) => {
  // Which result belongs to which message?
  // '3524578'
  // 4.1462643
};
```

The standard JSON-RPC solves that issue. This standard defines JSON representation of requests and response objects as “notification” objects, a way to define the method being called and arguments in the request, the result in the response, and a mechanism for associating requests and responses. It even supports error values and batching of requests. 

```jsx
// worker.postMessage
{"jsonrpc": "2.0", "method": "square_sum", "params": [4], "id": 1}
{"jsonrpc": "2.0", "method": "fibonacci", "params": [33], "id": 2}

// worker.onmessage
{"jsonrpc": "2.0", "result": "3524578", "id": 2} {"jsonrpc": "2.0", "result": 4.1462643, "id": 1}
```

In this case there’s a clear correlation between response messages and their request.

JSON-RPC uses JSON as the encoding when serializing messages. jsonrpc fields define version of the JSON-RPC that the message is adhering to. With the id properties it’s possible to correlate request and response objects.

## Command Dispatcher Pattern

RPC doesn’t provide a mechanism for determining what code path to execute on the receiving end. Command dispatcher pattern solves this, providing a way to take a serialized command, find the appropriate function, and execute it.

For example, assume we have two variables with relevant info about the method or command that the code needs to run. The first is a string called *method.* The second is an array of values passed into the method called *args*. As the code that needs to be run might live in different parts of the application, you’ll want to make a single repository that makes this commands to the code that needs to be run. This can be accomplished by a `Map` object or even a basic JavaScript object.

Another important thing is that only defined commands should be executed. If the caller wants to invoke a method that doesn’t exist, an error should be gracefully generated that can be returned to the caller, without crashing the web worker.

```jsx
const commands = {
	square_sum(max) {
		let sum = 0;
		for (let i =0; i < max; i++) sum += Math.sqrt(i);
		return sum;
	},
	fibonacci(limit) {
		let prev = 1n, next = 0n, swap;
		while (limit) {
			swap = prev; prev = prev + next;
			next = swap; limit--;
		}
		return String(next);
	}
};

function dispatch(methodm args) {
	if (commands.hasOwnProperty(method)) {
		return commands[method](...args);
	}
	throw new TypeError(`Command ${method} not defined!`);
}
```

In this example, the object `commands` contains the entire collection of commands supported by the command dispatcher.

The `dispatch()` function takes two arguments, the method name and the array of arguments. This function can be invoked when the web worker receives an RPC message representing the command. This function checks if the method exists with `commands.hasOwnProperty()` which is safer than calling them directly to prevent noncommand props like `_proto_` to be called. Then, the function is executed and either its result is returned or a `TypeError` is thrown.

# Putting it all together

We can combine the RPC pattern and the command dispatcher pattern to end up with an interface that makes working with web workers like working with other external libraries.

<aside>
💡 Check the ch2-patterns folder for the working example

</aside>