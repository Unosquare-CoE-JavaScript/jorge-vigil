# Jest

Created: April 11, 2022 12:07 PM

- React testing library helps with:
    - Rendering components into virtual DOM
    - Searching virtual DOM
    - Interacting with virtual DOM
- Needs a test runner
    - Find tests, run them, make assertions
    - Thats where Jest enters

# Jest

- Is recommended by Testing Library
- Comes with create-react-app

## Jest watch mode

- Watch for changes in files since last commit
- Only run tests related to these files
- No changes? no tests
    - type `a` to run all tests

## How does Jest works

- global *test* method has two args:
    - string description
    - test function
- Test fails if error thrown when running function
    - assertions throw errors when expectation fails
- No error? test pass
    - Empty tests passes