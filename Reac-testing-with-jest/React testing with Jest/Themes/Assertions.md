# Assertions

Created: April 11, 2022 11:59 AM

```jsx
expect(linkElement).toBeInTheDocument();
```

### expect

Jest global, starts the assertion

### expect argument

Subject of the assertion

### matcher

- type of assertion
- this matcher comes from Jest-DOM

### matcher argument

refines matcher

## Examples

```jsx
expect(element.textContent).toBe('hello');
```

```jsx
expect(elementsArray).toHaveLength(7)
```

## jest-dom

- Comes out of the box with create-react-app
- `src/setupTests.js` imports it before each test, makes matches available
- DOM-based matchers
    - `toBeVisible()` or `toBeChecked()`