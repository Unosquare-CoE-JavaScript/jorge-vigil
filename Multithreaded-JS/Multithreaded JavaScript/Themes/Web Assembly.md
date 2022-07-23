# Web Assembly

WASM is a binary-encoded instruction format that runs on a stack-based virtual machine. It’s designed with security in mind and runs in a sandbox where the only things it has access to are memory and functions provided by the host environment. Its motivation is to run the parts of the program that are performance-sensitive in an environment where execution can happen much faster than JS. It also provides a compile target for typically compiled languages like C, C++ or Rust.

The memory used by WebAssembly modules is represented by ArrayBuffers, but also can be represented by SharedArrayBuffers. There are also WASM instructions for atomic operations, similar to the Atomics object.

# WebAssembly Hello World

While WASM is a binary format, a plain text format exists to represent it in human readable form. Simply called WebAssembly text format, the file extension used is *.wat*.

<aside>
💡 The example can be found in the ch7-wasm-add/ directory

</aside>

This file declares a module, that takes in two 32-bit integers and returns another 32-bit integer. Then, in the function body, the first two instructions grab the function parameters and put them on the stack one after another.

<aside>
💡 WebAssembly is stack-based, which means many operations will operate on the first (if unary) or first two (if binary) items on the stack.

</aside>

The third statement is a binary “add” operation on i32 values. It grabs the top two values from the stack and adds them together, putting the result at the top of the stack. The return value for a function is the value at the top of the stack.

Lastly, the function needs to be exported in order to use it outside the module in the host environment.

We convert this WAT file to WebAssembly binary by using the wat2wasm tool from the WebAssembly Binary Toolkit (WABT). This can be done with the following code:

```jsx
$ npx -p wabt wat2wasm add.wat -o add.wasm
```

Then we use this WASM file in side JavaScript within the add.js file

# Atomic operations in WebAssembly

Some of the atomic operation instructions that are available follow somewhat the following syntax:

```jsx
[i32|i64].atomic.[load|load8_u|load16_u|load32_u]
```

The load family of instructions is equivalent to Atomics.load() in JS. The suffixed instructions allows to load smaller numbers of bits, extending the result with zeros.

```jsx
[i32|i64].atomic.[store|store8|store16|store32]
```

The store family of instructions is equivalent to the Atomics.store() in JS. The suffixed instructions wraps the input value to that number of bits and stores those at the index.

```jsx
[i32|i64].atomic.[rmw|rmw8|rmw16|rmw32].[add|sub|and|or|xor|xchg|cmpxchg][|_u]
```

The rmw family of instructions all perform read-modify-write operations, equivalent to add(), sub(), and(), or(), xor(), exchange(), and compareExchange() from t he Atomics object in JS. The operations are suffixed with a _u when they zero-extend, and rmw can have suffix corresponding to the number of bits to be read.

```jsx
memory.atomic.[wait32|wait64]
```

These are equivalent to Atomics.wait() sufixed according to the number of bits they operate on.

```jsx
memory.atomic.notify
```

Equivalent to Atomics.notify() in JS.

These instructions are enough to perform the same atomic operations in WebAssembly as we can in JS. But there’s an additional one:

```jsx
atomic.fence
```

This takes no arguments and doesn’t return anything. It’s intended to be used by higher-level languages that have ways of guaranteeing ordering of nonatomic accesses to shared memory.