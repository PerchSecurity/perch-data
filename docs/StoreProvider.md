# StoreProvider

The StoreProvider creates one global store instance that can be observed across the application.
This allows different modules and components to all hook into and observe the same store.
StoreProvider also creates a single API instance that uses the store from context to reactively update the shared store.

## Usage

```jsx
import { StoreProvider, cache } from 'perch-data';

const App = () => (
  <StoreProvider
    api={axiosInstance}
    initialValues={{ foo: 'bar' }}
    store={cache}
  >
    <YourApp />
  </StoreProvider>
);
```

## API

### Props

- `api: AxiosInstance` - This instance of Axios will be wrapped in AxiosStore and use the store from context
- `store: Object` - _**Required**_
  - `observeData: Function` - _**Required**_ Returns data from the cache or fetches it - see code for signature - must return an id for unsubscribing
  - `unobserveData: Function` - _**Required**_ Accepts an id and stops observing it
- `initialValues: Object` - This is a function to pre-populate your store with default values. If the value is already in the store (persisted) it _**will not**_ be overwritten.