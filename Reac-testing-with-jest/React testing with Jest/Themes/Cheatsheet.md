# Cheatsheet

Created: April 13, 2022 12:26 PM

[https://github.com/testing-library/jest-dom](https://github.com/testing-library/jest-dom)

[https://testing-library.com/docs/react-testing-library/cheatsheet](https://testing-library.com/docs/react-testing-library/cheatsheet)

# Screen query methods

```jsx
command[All]ByQueryType
```

### command

- `get`: expect element to be in the DOM
- `query`: expect element not to be in the DOM
- `find`: expect element to appear async

### [All]

- `(exclude)`:  expect only one match
- `(include)`: expect more than one match

### QueryType

- `Role`: most preferred
- `AltText`: images
- `Text`: display elements
- Form elements
    - `PlaceholderText`
    - `LabelText`
    - `DisplayValue`

# References

[https://testing-library.com/docs/queries/about/](https://testing-library.com/docs/queries/about/)

[https://testing-library.com/docs/react-testing-library/cheatsheet/](https://testing-library.com/docs/react-testing-library/cheatsheet/)

[https://testing-library.com/docs/queries/about/#priority](https://testing-library.com/docs/queries/about/#priority)