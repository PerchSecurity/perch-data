# Data

The Data component is the preferred method of getting data into a component. It uses the [Render Prop](https://reactjs.org/docs/render-props.html) approach for passing fetched data as a function to the children prop.

## Usage

```jsx
import { Data } from 'perch-data';
import { getNotifications } from './myapi'; // getNotifications returns a promise

const Notifications = () => (
  <div>
    <Data action={getNotifications}>
      {({ data, error, loading }) => {
        if (loading) return <div> Loading... </div>;
        if (error) return <div> ERROR! </div>;
        if (data) return <div> Notifications: {data.total_count} </div>;
      }}
    </Data>
  </div>
);

Notifications.propTypes = {};

export default Notifications;
```

## Why use Data over withData?

1. It can detect changes in Props and refetch data automatically
2. You can use State in your `variables` so no need to `applyParams`
3. Its just a component so debugging and composing are 🍰

## API

### Props

- `action: Function` - _**Required**_ Promise that will return the data
- `children: Function` - _**Required**_ Function to use with the Result object (below)
- `options: Object`
  - `pollInterval: Number` - Repeats the action every `N` seconds
  - `maxAge: Number` - Number of seconds to retain the result in the cache
- `variables: Object` - Object to be passed to `action` like so: `action(variables)` - note, if you pass new variables to `Data`, it will refetch the data with the new variables

### Context and Data

Whenever the `action` is called, it will receive two arguments: `variables` and `context`. Context is where the `store` and `api` live. **Please use these instead of a custom API or store instance**. By using an instance already attached to context, we can leverage the Action component to reactive update the component without any extra code.

### Result object

- `data: Object` - If the API request is successful, the response is returned here
- `loading: Boolean` - this is `true` while the data is being fetched. once it is returned or an error is thrown, the value will update to `false`
- `error: Object` - this Axios error object is returned if Axios throws an exception (404, 500, ERRCON, etc) or error thrown from a promise
- `refetch(): Function` - Function that triggers a refresh of the data
