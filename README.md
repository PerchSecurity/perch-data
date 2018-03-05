# Perch Data

perch-data is a set of tools for making the process of handling data less cumbersome.

🚀 Inspired by [react-apollo](http://dev.apollodata.com/react/queries.html).

## Installing

Currently only available via GitHub:

```sh
npm install usePF/perch-data
```

## Quick links:

- [the Data component](##Data)
- [withData](##withData)
- [cache](##cache)
- [axiosStore](##axiosStore)

## Data

The Data component is the preferred method of getting data into a component. It uses the [Render Prop](https://reactjs.org/docs/render-props.html) approach for passing fetched data as a function to the children prop.

### Usage

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
  </div>
);

Notifications.propTypes = {};

export default Notifications;
```

### Why use Data over withData?

1. It can detect changes in Props and refetch data automatically
2. You can use State in your `variables` so no need to `applyParams`
3. Its just a component so debugging and composing are 🍰

### API

#### Data component props:

- `action: Function` - _**Required**_ Promise that will return the data
- `children: Function` - _**Required**_ Function to use with the Result object (below)
- `options: Object`
  - `pollInterval: Number` - Repeats the action every `N` seconds
  - `maxAge: Number` - Number of seconds to retain the result in the cache
- `variables: Object` - Object to be passed to `action` like so: `action(variables)` - note, if you pass new variables to `Data`, it will refetch the data with the new variables

#### Result object:

- `data: Object` - If the API request is successful, the response is returned here
- `loading: Boolean` - this is `true` while the data is being fetched. once it is returned or an error is thrown, the value will update to `false`
- `error: Object` - this Axios error object is returned if Axios throws an exception (404, 500, ERRCON, etc) or error thrown from a promise
- `refetch(): Function` - Function that triggers a refresh of the data

## withData

withData is a [Higher Order Component](https://reactjs.org/docs/higher-order-components.html) (HOC) that wraps any component with a new prop: `data`.

### Why use withData over Data?

1. There really is not a great reason unless you're grabbing several different pieces of info, but a better approach would be to compose the Data components or actions
2. You really like HOCs

### Usage

```jsx
import { withData } from 'perch-data';
import { getNotifications } from './myapi'; // getNotifications returns a promise

const Notifications = ({ data: { notifications } }) => (
  <div>
    {notifications.results && doSomethingWith(notifications.results)}
  </div>
);

Notifications.propTypes = {
  data: PropTypes.shape({
    notifications: PropTypes.shape({}).isRequired,
  }).isRequired,
};

export default withData({ notifications: getNotifications })(Notifications);
```

### API

```js
withData(queryObject: Object)
```

The withData function currently only accepts one argument, an object of queries to execute.

For each entry, the key is the **desired name of the entry** in the data prop and the value is the **function that will yield the corresponding data** (as a promise). The name of the entry is also used as the default cacheKey, if the action does not provide one.

In the following snippet, the child component will get a `data` prop with a `notifications` entry that will eventually resolve the vaule of `getNotifications`.

```js
withData({
  notifications: getNotifications
})
```

### Using props

Using props is simple, just wrap your function in a function. The only parameter is `props`.

In the following snippet, the `params` prop from [React Router v3](https://github.com/ReactTraining/react-router/tree/v3/docs) is used to pass the id of the notification to the API.

```js
withData({
  notification: (props) => getNotification(props.params.id)
})

// With object destructuring
withData({
  notification: ({ params }) => getNotification(params.id)
})
```

### Cache control options

By default, every entry is cached for one second. You can overwrite this by passing an array (instead of a function) as the entry's value, with the first item being the action (function that returns a promise) and the second being an object with any of the following properties:

- `maxAge: Number` - sets the time (in seconds) that the data should be cached
- `noCache: Boolean` - skips the cache lookup and forces the action to be run

In the following snippet, we will ignore the cached data for `notifications` and keep the freshly-loaded data for 5 minutes.

```js
withData({
  notifications: [getNotifications, { maxAge: 5 * 60, noCache: true }]
})
```

**NOTE:** Any action that you would like to handle the caching for should return `__cacheKey` and `__fromCache` properties in the result to avoid the default cache from overriding any custom caching.

Consider implementing the store.js [expire plugin](https://github.com/marcuswestin/store.js/blob/master/plugins/expire.js) to prevent key recycling if your action uses store.js internally. See [axios-store-plugin](https://github.com/usePF/axios-store-plugin) for an example implementation of custom caching.

### Polling

If you want to poll an action at a regular interval, pass a `pollInterval` entry to the options object like we did for cache-control above. The poll will automatically start when the component is mounted and clear when the component is unmounted.

The following snippet will call `getNotifications` every 5 seconds:

```js
withData({
  notifications: [getNotifications, { pollInterval: 5 }]
})
```

### Composing HOCs

If you have another HOC in the component like [withStyles](https://material-ui-next.com/customization/css-in-js/#api) you will want all of the HOCs to be applied. You can simply "nest" them as you would for function composition, or use a library like [Recompose](https://github.com/acdlite/recompose).

### The data prop

The `data` prop will have one entry for each action you pass it, and that entry will have the following properties:

- `loading: Boolean` - this is `true` while the data is being fetched. once it is returned or an error is thrown, the value will update to `false`
- `error: Object` - this Axios error object is returned if Axios throws an exception (404, 500, ERRCON, etc)
- `refetch(): Function` - function that refetches the data for the given entry
- `applyParams(params: Object): Function` - function that allows a resource to be sorted, filtered, paginated, etc.
- If the API request is successful, the response is spread into the entry for the action.

Continuing with the example from above:

```jsx

// notifications is being returned from the API like so
// {
//   page_number: 1,
//   total_count: 47,
//   page_size: 20,
//   results: [ /* an array of notification objects */ ]
// }

const Notifications = ({ data: { notifications } }) => (
  <div>
    {notifications.loading && <LoadingSpinner />}
    {notifications.error && <ErrorMessage error={notifications.error} />}
    {notifications.results &&
      notifications.results.map(notification => (
        <Notification
          id={notification.id}
          key={notification.id}
          message={notification.message_text}
        />
      )
    )}
  </div>
);
```

### Sorting, filtering and paginating data via applyParams()

Every entry in the `data` prop has a `applyParams()` function added to it. This function accepts one parameter (params: Object)

```jsx
const Notifications = ({ data: { notifications } }) => {
  const nextPage = (notifications.page_number || 0) + 1;
  return (
  <div>
    <button onClick={() => notifications.applyParams({ page: nextPage })}>Load more</Button>
  </div>
);
```

```jsx
const Notifications = ({ data: { notifications } }) => {
  return (
  <div>
    <button onClick={() => notifications.applyParams({ orderby: 'priority' })}>Load more</Button>
  </div>
);
```

```js
const Notifications = ({ data: { notifications } }) => {
  return (
  <div>
    <button onClick={() => notifications.applyParams({ filter: 'foo' })}>Load more</Button>
  </div>
);
```

### Reloading data via refetch()

If at any point you want to re-request the data from the server, the `refetch()` function can be used to re-execute the data fetch. This will not reset pagination or other params, instead redoing exactly the same query that was last executed.

```jsx
const Notifications = ({ data: { notifications } }) => (
  <div>
    <button onClick={notifications.refetch}>Reload Data</Button>
  </div>
);
```

### Optimistic UI updates with via optimisticUpdate()

After sending data to the server you may want to update the UI before refetching - that's why `optimisticUpdate()` exists. This function can be used to temporarily update the data _for the current component_. This **does not** update the store so it will not apply to other components that are observing the query.

### Error handling

Currently `withData` assumes that your error will be [formatted like an Axios error](https://github.com/axios/axios#handling-errors). This was explicitly added to filter out any errors from the child component that were not caused by data fetching.

In the future, this may become more generic and support other formats.
