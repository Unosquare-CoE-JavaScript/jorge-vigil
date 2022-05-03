# Wait for

Created: April 18, 2022 12:02 PM

Lets take this example

```jsx
const alerts = await screen.findAllByRole('alert');
expect(alerts).toHaveLength(2);
```

In this case, we expect 2 alerts to be displayed in the page, they may be from different components, responses, etc.

But the moment we have only one alert the await will unlock and populate the alerts variable.

This will cause the test to fail since we’re expecting 2 alerts to be on the page

## waitFor

We can wrap our expect code within a waitFor block to expect certain requisites to be fulfilled.

```jsx
waitFor(async () => {
	const alerts = await screen.findAllByRole('alert');
	expect(alerts).toHaveLength(2);
});
```