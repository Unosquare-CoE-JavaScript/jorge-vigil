# TDD

Created: April 11, 2022 12:18 PM

- Write tests before writing code
    - then write code according to “spec” set by tests
- “Red-green” testing
    - Test fail before code is written

![Untitled](TDD%208e6aae54fb8f49539c4372f9df5217ce/Untitled.png)

## Why TDD

- Makes a huge difference in how it feels to write tests
    - Part of the coding process, not a “chore” to do at the end
- More efficient
    - Re-run  tests “for free” after changes

# Types of tests

- Unit tests
    - Test isolated units of code
- Integration tests
    - How multiple units work together
- Functional tests
    - Tests a particular function of software
    - In this case a particular behavior
- Acceptance / E2E tests
    - Use actual browser and server (Cypress, Selenium)

# TDD vs BDD

- Testing library encourages testing *behavior* over *implementation*
- but...
- BDD is very explicitly defined
    - involves collaboration between lots of roles
    - developers, QA, business partners, etc
    - defines process for different groups to interact