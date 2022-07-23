# Shared Memory

While the web workers API for browsers and the worker threads module in Node.js are powerful tools for working with concurrency in JS, the interaction between them is really shallow. It depends on the message-passing APIs, that depends on the event loop, to handle the receipt of a message.

Now we’ll explore the Atomics object and the SharedArrayBuffer class. These allow to share memory between two threads without depending on message passing.

# Intro to shared memory

A very basic application that is able to communicate between two web workers.

## Shared memory in the browser

<aside>
💡 Check the ch4-web-workers folder for the working code

</aside>

The global variable `crossOriginIsolated` checks whether or not `SharedBuffer` can be instantiated by the JS code currently being run. For security reasons, the `SharedArrayBuffer` object isn’t always available for instantiation. And Chrome and Firefox require additional HTTP headers to be set when the document is served before it will allow a `SharedArrayBuffer` to be instantiated. Node doesn’t have these restrictions. The required headers are:

```jsx
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

These are already set in the test server. A production-ready application needs you to set this headers manually.

Notice the `.foo` property defined in the `worker.js` shows as undefined in the `main.js` file. This is because even though a reference to the memory location that stores the data contained in the buffer has been shared between the two environments, the actual object has not been shared.

## Shared memory in Node.js

The `Node.js` equivalent to the previous code looks similar, however, the Worker global isn’t available, and the worker thread won’t make use of `self.onmessage`. Instead, the worker threads module must be required to gain access to this functionality.

<aside>
💡 Check the ch4/web-workers for the code. Files main-node.js and worker-node.js

</aside>

# SharedArrayBuffer and TypedArrays

Interaction with binary data has been a recent addition to JavaScript environments. It wasn’t until `Node.js` that piping binary became a necessity. Since there wasn’t a convenient buffer structure available, the authors created `Buffer`.

The contents of `ArrayBuffer` and `SharedArrayBuffer` can’t be directly modified. Instead a “view” into the buffer must be created first. Also, when an `ArrayBuffer` is instantiated the contents of the buffer are initialized to 0.

Both `ArrayBuffer` and `SharedArrayBuffer` inherit from `Object` and come with its associated methods. Other than that, they come with two properties. The first one is the read-only value `.byteLength`, representing the byte length of the buffer, and the second is the `.slice(begin, end)` method, which returns a copy of the buffer depending on the range that is provided.

```jsx
const ab = new ArrayBuffer(8);
const view = new UintArray(ab);

for (i = 0; i < 8; i++) view[i] = i;

console.log(view);
/**
 * UintArray(8) [
 *	0, 1, 2, 3,
 *	4, 5, 6, 7
 * ] 
 */

ab.byteLength;    // 8
ab.slice();       // 0, 1, 2, 3, 4, 5, 6, 7
ab.slice(4, 6);   // 4, 5
ab.slice(-3, -2); // 5
```

Different JavaScript environments will display the contents of an `ArrayBuffer` instance differently. Some won’t display the data at all unless its passed through a view first.

# Atomic methods for data manipulation

*Atomicity* is a particular term used specially in databases. An operation is *atomic* if while the overall operation may be composed of multiple smaller steps, the overall operation is guaranteed to either entirely success or entirely fail.

JavaScript provides a global object named `Atomics` with several static methods available on it. Similar in pattern to the `Math` global that cannot be instantiated with the new operator, and the methods are stateless.

## Atomics.add()

```jsx
old = Atomics.add(typedArray, index, value)
```

This method adds the provided `value` to the existing value in a `typedArray` that is located at `index`. The old value is returned. Non atomically it looks like this:

```jsx
const old = typedArray[index];
typedArray[index] = old + value;
return old;
```

## Atomics.and()

```jsx
old = Atomics.and(typedArray, index, value)
```

Performs a bitwise `and` using `value` with the existing value in `typedArray` located at `index`. The old value is returned. Non atomically:

```jsx
const old = typedArray[index];
typedArray[index] = old & value;
return old;
```

## Atomics.compareExchange()

```jsx
old = Atomics.compareExchange(typedArray, index, oldExpectedValue, value)
```

Checks `typedArray` to see if the value `oldExpectedValue` is located at `index`. If so, the value is replaced with `value`. Old value is always returned. Non atomically:

```jsx
const old = typedArray[index];
if (old === oldExpectedValue) {
	typedArray[index] = value;
}
return old;
```

## Atomics.exchange()

```jsx
old = Atomics.exchange(typedArray, index, value)
```

Sets the value in `typedArray` located at `index` to `value`. Old value is returned. Non atomically:

```jsx
const old = typedArray[index];
typedArray[index] = value;
return old;
```

## Atomics.isLockFree()

```jsx
free = Atomics.isLockFree(size)
```

Returns a `true` if size is a value that appears as the `BYTES_PER_ELEMENT` for any of the `TypedArray` sub classes, and `false` if otherwise. If `true`, then using the `Atomics` methods will be quite fast using the system’s hardware. If `false`, then the application might want to use a manual locking mechanism.

## Atomics.load()

```jsx
value = Atomics.load(typedArray, index)
```

Returns the value in `typedArray` located at `index`. Non atomically:

```jsx
const old = typedArray[index];
return old;
```

## Atomics.or()

```jsx
old = Atomics.or(typedArray, index, value)
```

Performs a bitwise `or` using `value` with the existing value in `typedArray` located at `index`. Old value is returned. Non atomically:

```jsx
const old = typedArray[index];
typedArray[index] = old | value;
return old;
```

## Atomics.store()

```jsx
value = Atomics.store(typedArray, index, value)
```

Stores the provided value in `typedArray` located at `index`. The value that was passed in is then returned. Non atomically:

```jsx
typedArray[index] = value;
return value;
```

## Atomics.sub()

```jsx
old = Atomics.sub(typedArray, index, value)
```

Subtracts the provided `value` from the existing value in `typedArray` located at `index`. Old value is returned. Non atomically:

```jsx
const old = typedArray[index];
typedArray[index] = old - value;
return old;
```

## Atomics.xor()

```jsx
old = Atomics.xor(typedArray, index, value)
```

Performs a bitwise `xor` using `value` with the existing value in `typedArray` at `index`. Old value is returned. Non atomically:

```jsx
const old = typedArray[index];
typedArray[index] = old ^ value;
return old;
```

# Atomicity concerns

Taking the `Atomics.compareExchange()` method as an example, which takes an `oldExpectedValue` and a new `value`, and replaces the existing value only if it equals `oldExpectedValue` with the new `value`.

Suppose we have a Uint8Array named typedArray, and the 0th element is set to 7. Then, imagine that multiple threads have access to that same typedArray, and each of them executes some variant of the following code:

```jsx
let old1 = Atomics.compareExchange(typedArray, 0, 7, 1); // Thread #1
let old2 = Atomics.compareExchange(typedArray, 0, 7, 2); // Thread #2
```

Atomicity guarantees that exactly one of the threads will have the initial 7 returned, while the other will get the updated value of 1 or 2 returned. The troubles are incremented when using the non atomically version of the code.

For this code to function properly it would need a guarantee that other threads aren’t able to read or write to the value while the code is running. This guarantees that only one thread gets access to shared resources is called a *critical section*.

Some cases of having threads trying to access a shared resource generates a kind of bug known as *race condition*, where two or more threads are racing against each other to perform some action. These bugs don’t happen consistently, are hard to reproduce, and don’t happen in all the environments.

# Data serialization

Sometimes we’ll need to store a non numeric data  using a buffer. When this happens we need to serialize that data before writing it to the buffer, and later deserialize it when reading from the buffer.

## Booleans

Easy to represent because they take a single bit to store the data. So we can use one of the smallest views such as a Uint8Array, then point it at an `ArrayBuffer` with a byte length of 1.

When storing data in individual bits like this, start from the least significant bit, then move on to more significant bits.

The following is an example of how to store and retrieve these boolean values so that they’re backed in an `ArrayBuffer`:

```jsx
const buffer = new ArrayBuffer(1);
const view = new Uint8Array(buffer);

function setBool(slot, value) {
	view[0] = (view[0] & ~(1 << slot)) | ((value | 0) << slot);
}

function getBool(slot) {
	return !((view[0] & (1 << slot)) === 0);
}
```

This creates a one-byte buffer (0b00000000) then creates a view into the buffer. To set the value in the least significant bit to true, use `setBool(0, true)`. To set the second least significant bit to false, call `setBool(1, false)`. To retrieve the values stored at the third least significant digit, then call `getBool(2)`.

The `setBool()` function works by taking the boolean value and converting it into an integer (value | 0 converts false to 0 and true to 1). Then it shifts the value left by adding zeros to the right based on which slot to store it in. Then inverts the bits (using `~`), and gets a new value by AND-ing the existing value with this new value `(view[0] & ~(1 << slot))`. Finally, the modified old value and the new shifted values are OR-ed together and assigned to `view[0]`. Basically, it reads the existing bits, replaces the appropriate bit, and writes the bits back.

The `getBool()` function works by taking the number 1, shifting it based on the slot, then using `&` to compare it to the existing value. The shifted value (right of the `&`) only contains a single 1 and seven 0s. The AND-ing between this modified value and the existing one returns either a number representing the value of the shifted slot, assuming the value at the slot position located at `view[0]` was truthy; otherwise, it returns 0. This value is then checked to see if it is exactly equal to 0 and the result of that is negated. Basically it returns the value of the bit at slot.

This code is an example and is not recommended for production, since it’s not designed to work with buffers larger that a single byte. A production-ready version would consider the size of storage and do bounds checking.

## Strings

There are many ways to encode individual characters using strings. Since its impossible to represent all existing characters using ASCII alone, we use encoding systems where a variable number of bytes can be used to represent a single character. JS uses a variety of of encoding formats to represent strings depending on the situation, this complexity is hidden from our applications. Possible formats:

- UTF-16 which uses 2 or 4 bytes to represent a character, or even 14 bytes to represent emojis.
- UTF-8, which uses 1 to 4 bytes of storage per character and is backwards compatible with ASCII.

We need to be careful when using `ArrayBuffer` to represent certain characters since they’re represented internally by values greater than those defined in the respective `ArrayBuffer`. Thus encoding them and then converting back into a character produces the wrong value.

Fortunately an API in modern JS for encoding and decoding strings directly to `ArrayBuffer` instances exist. Is provided by the globals `TextEncoder` and `TextDecoder`, which are globally available in browser and Node.js environments. These use UTF-8 encoding due to its ubiquity.

```jsx
const enc = new TextEncoder();
enc.encode('foo'); // Uint8Array(3) [ 102, 111, 111 ]
enc.encode('€');   // Uint8Array(3) [ 226, 130, 172 ]
```

```jsx
const ab = new ArrayBuffer(3);
const view = new Uint8Array(ab);
view[0] = 226; view[1] = 130; view[2] = 172;
const dec = new TextDecoder();
dec.decode(view); // '€'
dec.decode(ab);   // '€'
```

Notice that `TextDecoder#decode()` works with either the `Uint8Array` view, or with the underlying `ArrayBuffer` instance. This makes it convenient to decode data that we may receive from a network call without the need to first wrap it in a view.

## Objects

Objects can already be represented as strings in JSON. One option is to take an object that you’d like to make use of across two threads, serializing it into a JSON string, and writing that string to an array buffer using the same `TextEncoder` API used in the previous section. For example:

```jsx
const enc = new TextEncoder();
return enc.encode(JSON.stringify(obj));
```

JSON takes the object and converts it into a string representation. This causes redundancies in the output. To reduce the size of the payload, use a format like `MessagePack`, which reduces the size of a serialized object by representing metadata using binary data. The `msgpack5` npm package is a browser and Node.js compatible package to achieve that.

Now, since most of the performance issues when communicating between threads is mostly due to the cost of serializing and deserializing data, it’s usually better to use simpler representations. Even the structured clone algorithm, combined with the `.onmessage` and `.postMessage` methods are faster than serializing objects and writing them to buffers.