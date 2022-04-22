# Wrapping tests with a context provider

Created: April 18, 2022 4:58 PM

# First way

One way of wrapping components in tests, in case they need a context provider for example, is to use the wrapper option when instantiating the component in the render method

```jsx
import { myContextProvider } from './contexts/myContextProvider';

test('test example', async () => {
  render(<MyComponent />, { wrapper: myContextProvider });
});
```

# Second way

Another way to wrap components so they can access a context, so there’s no need to use the wrapper option, is to to override the existing render methods in a custom file

In this example, we can create a file in `src/tests-utils/testing-library-utils.js`

```jsx
import { render } from '@testing-library/react';
import { myContextProvider } from './contexts/myContextProvider';

const renderWithContext = (ui, options) =>
  render(ui, { wrapper: myContextProvider, ...options });

// re export everything
export * from '@testing-library/react';

// override render method
export { renderWithContext as render };
```

Then instead of using the default render method from the testing-library, we can simply use our overrode render method in our tests

```jsx
import { render, screen } from './test-utils/testing-library-utils';

test('test example', async () => {
  render(<MyComponent />);
});
```

The wrapper is already defined in the overrode render method.