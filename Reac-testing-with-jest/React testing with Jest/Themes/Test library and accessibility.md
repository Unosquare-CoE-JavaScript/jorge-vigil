# Test library and accessibility

Created: April 11, 2022 12:51 PM

# Testing lib and finding elements

- Testing lib recommends finding elements by accessibility handles
    - [https://testing-library.com/docs/queries/about/#priority](https://testing-library.com/docs/queries/about/#priority)
    - What priority we should use when querying elements in virtual DOM?
- create-react-app example tests uses `getByTest`
    - ok for non-interactive elements
    - better: `getByRole`
- How to know what role to look for?
    - [https://www.w3.org/TR/wai-aria/#role_definitions](https://www.w3.org/TR/wai-aria/#role_definitions)
    - available roles
    - Some elements have built-in roles (ie. button, a)
- Can’t find an element like a screen reader would?
    - The app is not screen reader friendly