# <Suspense />

Created: May 2, 2022 3:41 PM

- Allows React to “suspend” rendering a component subtree
    - Used when a (grand) child component is not ready to be rendered
        - ECMAScript bundle containing the component isn’t loaded yet
        - The data needed for a component to render isn’t available yet
- The “fallback” component will be rendered instead
    - Replaces the complete children component tree
- Rendering is suspended when a promise is thrown
    - And resumed when the promise resolves

# SWR and suspense

SWR is a library and its used in the course app to load the data. It includes a convenient hook to fetch data

Makes it easier to start using suspense.

- Add `suspense: true` to the `<SWRConfig />`

# Changes

Check the project repo for the changes. Some components got simplified, since they consume data and are concerned about data not being fetched and potential errors. Thus they have code that contemplates that and its not needed any more.

## Files:

- src/index.tsx
- src/components/users/UserList.tsx
- src/components/users/AccountDetails.tsx
- src/components/users/MovieDetails.tsx

### TS Bang operator (extra)

Non-null assertion operator. 

```jsx
const account = data!;
```

It’s a way to tell the compiler "this expression cannot be `null` or `undefined` here, so don't complain about the possibility of it being `null` or `undefined`."

[Explanation](https://github.com/Microsoft/TypeScript/wiki/What's-new-in-TypeScript#non-null-assertion-operator)

> A new `!` post-fix expression operator may be used to assert that its operand is non-null and non-undefined in contexts where the type checker is unable to conclude that fact. Specifically, the operation `x!` produces a value of the type of `x` with `null` and `undefined` excluded. Similar to type assertions of the forms `<T>x` and `x as T`, the  non-null assertion operator is simply removed in the emitted JavaScript code.
>