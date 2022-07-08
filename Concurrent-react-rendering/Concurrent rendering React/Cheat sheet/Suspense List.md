# Suspense List

Created: May 3, 2022 3:24 PM

`<SuspenseList />` allows us to control multiple `<Suspense />` components render their fallback

- The order in which child components show when ready
- If multiple child fallback components are displayed

<aside>
⚠️ At the time this doc is being written, the <SuspenseList /> component has being removed from the main branch in React 18. It has been moved to the experimental tag

</aside>

# Implementation

```jsx
export function UserDetails({ userId, movieId }: Props) {
  return (
    <div>
			<SuspenseList revealOrder="together">
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
			</SuspenseList>
    </div>
  );
}
```