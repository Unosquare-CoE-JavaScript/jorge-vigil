# Using useTransition

Created: May 3, 2022 4:22 PM

The `useTransition` hook defers low priority work and allows responding to pending updates

- `useTransition` can be used to control how React renders when a component is suspended
    - Prevents the fallback component to render immediately
- The new components will be rendered when
    - Their resources are ready
    - The timeout is expired
- The old UI can use the `isPending` state when rendering

# Implementing

```jsx
// src/components/primes/PrimeNumbers.tsx
export function PrimeNumbers() {
	const [isPending, startTransition] = useTransition();
	...
	return (
		<div className='row'>
      <h2 className='text-center mt-5'>Prime Numbers</h2>
      <PrimeRange
        defaultValue={defaultValue}
        onChange={(value) => startTransition(() => setMaxPrime(value))}
      />

      <div className='row row-cols-auto g-2'>
        {values
          .filter((_, index) => index < 10_000)
          .map((_, index) => {
            return (
              <CheckNumber
                key={index}
                value={maxPrime - index}
                isPending={isPending}
              />
            );
          })}
      </div>
    </div>
	);
}
```

The `onChange` prop of the `PrimeRange` component remains the same as before. But now we have access to the `isPending` value from the `useTransition` hook, that we can use in the CheckNumber component which supports that functionality.

# startTransition vs useTransition

**startTransition**:

- Can be used anywhere
- No additional renders

**useTransition**

- Needs to be used in a functional component
- One additional render with `isPending`