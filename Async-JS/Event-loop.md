# Event loop

Created: April 19, 2022 12:43 PM

> Its through the event loop that synchronicity is achieved
> 
- An async function makes use of callbacks
    - When its operation is completed, a message is queued
    - At some time in the future, the message is dequeued and the callback is fired
- Event loop continuously checks for queued messages
- JS is a single-threaded environment but asynchronicity allows to “set code aside” for future execution
- Event loop manages the execution of priority statements & once they’re done, starts taking care of the messages
- When an asynchronous code is called, a message is added to the message queue
- Event loop assess the call stack. If its empty checks in the message queue if there’s any code to add to the call stack

# Resources

[https://levelup.gitconnected.com/javascript-and-asynchronous-magic-bee537edc2da](https://levelup.gitconnected.com/javascript-and-asynchronous-magic-bee537edc2da)

[https://dev.to/kapantzak/js-illustrated-the-event-loop-4mco](https://dev.to/kapantzak/js-illustrated-the-event-loop-4mco)