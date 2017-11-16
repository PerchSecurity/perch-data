# withData

⚛️ withData is a [Higher Order Component](https://reactjs.org/docs/higher-order-components.html) (HOC) that wraps any React component and gives it a new prop: `data`.

🚀 Inspired by [react-apollo](http://dev.apollodata.com/react/queries.html).

## Installing

Currently only availble via GitHub:

```sh
npm install usePF/withdata
```

## Usage

```js
import withData from 'withdata';
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

## API

How to use and love the withData HOC.

### withData()

```js
withData(queryObject: Object)
```

The withData funtion currently only accepts one argument, an object of queries to execute.

For each entry, the key is the **desired name of the entry** in the data prop and the value is the **function that will yeild the corrosponding data** (as a promise). The name of the entry is also used as the default cacheKey, if the action does not provide one.

In the following snippet, the child component will get a `data` prop with a `notifications` entry that will eventually resolve the vaule of `getNotifications`.

```js
withData({
  notifications: getNotifications
})
```

#### Using props

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

#### Cache control options

By default, every entry is cached for one second. You can overwrite this by passing an array (instead of a function) as the entry's value, with the first item being the action (function that returns a promise) and the second being an object with any of the following properties:

- `maxAge: Number` - sets the time (in seconds) that the data should be cached
- `noCache: Boolean` - skips the cache lookup and forces the action to be run

In the following snippet, we will ignore the cached data for `notifications` and keep the freshly-loaded data for 5 minutes.

```js
withData({
  notifications: [getNotifications, { maxAge: 5 * 60, noCache: true }]
})
```

**NOTE:** Any action that you would like to do custom caching with but return a `cacheKey` and `fromCache` property to avoid the default behavior from overriding the custom action cache. You should implement the store.js [expire plugin](https://github.com/marcuswestin/store.js/blob/master/plugins/expire.js) to prevent key recycling if your action uses store.js internally. See [axios-store-plugin](https://github.com/usePF/axios-store-plugin) for an example implementation.

#### Polling

If you want to poll an action at a regular interval, pass a `pollInterval` entry to the options object like we did for cache-control above. The poll will automaticlly start when the component is mounted and clear when the component is unmounted.

The following snippet will call `getNotifications` every 5 seconds:

```js
withData({
  notifications: [getNotifications, { pollInterval: 5 }]
})
```

#### Composing HOCs

If you have another HOC in the component like [withStyles](https://material-ui-next.com/customization/css-in-js/#api) you will want all of the HOCs to be applied. You can simply "nest" them as you would for function composition, or use a library like [Recompose](https://github.com/acdlite/recompose).

### The data prop

The `data` prop will have one entry for each action you pass it, and that entry will have the following properties:

- `loading: Boolean` - this is `true` while the data is being fetched. once it is returned or an error is thrown, the value will update to `false`
- `error: Object` - this Axios error object is returned if Axios throws an exception (404, 500, ERRCON, etc)
- `refetch(): Function` - function that refetches the data for the given entry
- `goToPage(page: Number): Function` - function that allows paginated resources to change pages
- If the API request is successful, the response is spread into the entry for the action.

Continuing with the example from above:

```js

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

### Pagination via goToPage()

Every entry in the `data` prop has a `goToPage()` function added to it. This function accepts one parameter (page: Number)

```js
const Notifications = ({ data: { notifications } }) => {
  const nextPage = (notifications.page_number || 0) + 1;
  return (
  <div>
    <button onClick={() => notifications.goToPage(nextPage)}>Load more</Button>
  </div>
);
```

### Reloading data via refetch()

If at any point you want to re-request the data from the server, the `refetch()` function can be used to re-execute the data fetch. This will not reset pagination, instead redoing exactly the same query that was originally executed.

```js
const Notifications = ({ data: { notifications } }) => (
  <div>
    <button onClick={notifications.refetch}>Reload Data</Button>
  </div>
);
```

### Error handling

Currently `withData` assumes that your error will be [formatted like an Axios error](https://github.com/axios/axios#handling-errors). This was explicitly added to filter out any errors from the child component that were not caused by data fetching.

In the future, this may become more generic and support other formats.
