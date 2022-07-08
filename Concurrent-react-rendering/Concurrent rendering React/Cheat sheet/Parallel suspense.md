# Parallel suspense

Created: May 3, 2022 1:37 PM

- Multiple suspense boundaries can suspend in parallel
    - React will suspend them all and show multiple fallback components
- If you want to render a component while others are still loading
- Multiple suspending components in a single `<Suspense />` is also fine
    - Will resume when all resource promises are resolved

# Implementation

```jsx
// src/components/users/UserDetails.tsx
export function UserDetails({ userId, movieId }: Props) {
  return (
    <div>
      <h4 className='text-center mt-5'>User details</h4>
      <Suspense fallback={<Loading />}>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <AccountDetails userId={userId} />
        </ErrorBoundary>
      </Suspense>
      <h4 className='text-center mt-5'>Favorite movie</h4>
      <Suspense fallback={<Loading />}>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <MovieDetails movieId={movieId} />
        </ErrorBoundary>
      </Suspense>
    </div>
  );
}
```

In this example there’s two parallel suspense calls for each of the user details, one suspending the load for `AccountDetails` and other for the `MovieDetails`

# Little detail with jumpy placeholder

In React 17 we can se the `MovieDetails` component loads faster than the `AccountDetails` which causes the later to push down the page contents. In React 18 we can use a `SuspenseList` component to coordinate multiple suspense boundaries and control how they show up.