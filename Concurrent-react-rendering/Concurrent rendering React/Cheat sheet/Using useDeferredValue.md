# Using useDeferredValue

Created: May 3, 2022 4:43 PM

The `useDeferredValue` hook can be used to create a deferred version of the value that may lag behind

- Can prevent extra re-renders of expensive components

[https://17.reactjs.org/docs/concurrent-mode-reference.html#usedeferredvalue](https://17.reactjs.org/docs/concurrent-mode-reference.html#usedeferredvalue)

# Implementing

```jsx
const deferredValue = useDeferredValue(value);
```