# Suspense & errors

Created: May 2, 2022 6:22 PM

# How does suspense works in error case

- If a suspense resource fails to load an error is thrown
    - When requesting during the `render()`
- Catch the error using an `errorBoundary`
    - Just like other runtime errors in React lifecycle functions
- Error boundaries can be nested
    - Just like suspense boundaries

```jsx
// src/index.tsx
<ErrorBoundary FallbackComponent={ErrorFallback}>
...
```

When there’s an error (ie. while fetching) in a subcomponent the `errorBoundary` catches it and displays the corresponding error.