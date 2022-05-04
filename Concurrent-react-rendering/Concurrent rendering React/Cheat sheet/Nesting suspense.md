# Nesting suspense

Created: May 2, 2022 6:51 PM

Similar to nesting `errorBoundary` except with a little more flexibility

- Multiple suspense components can be nested
- React will use the closets parent `<Suspense />` component
    - Very useful to control what part of the UI is replaced by a fallback

<aside>
⚠️ There’s a behavior change in React 18 with null fallback

</aside>

# Implementing

```jsx
// src/App.tsx
<div className="container">
  <BrowserRouter>
    <NavBar />
    <Suspense fallback={<Loading />}> {/* <--- HERE */}
      <AppRoutes />
    </Suspense>
  </BrowserRouter>
</div>
```