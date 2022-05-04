# Using startTransition

Created: May 3, 2022 4:08 PM

In the `PrimeNumbers.tsx` file we currently have a loading problem where the range input position lags behind user click. Generating the prime numbers list could become low priority work in comparison with responding user input, as such we could deffer it with `startTransition` API.

# Implementing

```jsx
// src/components/primes/PrimeNumbers.tsx
...
<PrimeRange
        defaultValue={defaultValue}
        onChange={(value) => startTransition(() => setMaxPrime(value))}
      />
```

Defining the `onChange` prop as the result of executing the `startTransition` function has an enormous impact on user interaction.

<aside>
⚠️ In React 17 this kinda implementation wasn't really possible without other tricks like `debouncing` or `useThrottle`

</aside>