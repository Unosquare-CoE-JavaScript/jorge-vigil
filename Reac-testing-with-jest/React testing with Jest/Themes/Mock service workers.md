# Mock service workers

Created: April 14, 2022 2:14 PM

# Why

- Intercept network calls
- Return specified responses
- Prevents network calls during test
- Set up test conditions using server response

# How

```jsx
npm i msw
```

- Create handlers
- Create test server
- Make sure test server listens during all tests
    - Reset after each test

## Example

```jsx
rest.get('http://localhost:3030/scoops'), (req, res, ctx) => {});
```

- **Handler type:** rest or graphql
- **Http method to mock:** get, post, etc
- **Full URL to mock**
    - Response resolver function
        - `req`: request object
        - `res`: function to create response
        - `ctx`: utility to build response
        
        [https://mswjs.io/docs/basics/response-resolver](https://mswjs.io/docs/basics/response-resolver)
        

 

## Issue when testing a request mock

Sometimes when testing a request mock, an error will be thrown showing that there’s no content in the page that corresponds with the requested data.

This is usually due to the data being loaded asynchronously. The value is expected before the data load has been completed.

### await findBy

<aside>
💡 When waiting for something to appear asynchronously on the page, `await findBy` must be used

</aside>