# Action component

The Action component is the preferred method of triggering actions from within a component. It uses the [Render Prop](https://reactjs.org/docs/render-props.html) approach for passing an action as a function to the children prop.

## Usage

```jsx
import { Action } from 'perch-data';
import { createNotification } from './myapi'; // createNotification returns a promise

const Notifications = () => (
  <div>
    <Action action={createNotification} variables={this.state}>
      {(create, { data, loading, error }) => (
        <div>
          <button onClick={create} disabled={loading}>
            Create Notification
          </button>
        </div>
      )}
    </Action>
  </div>
);

Notifications.propTypes = {};

export default Notifications;
```

## What value does Action add over just calling the function?

1. It can be passed `variables` for easy, declarative actions
2. It can be passed `refetchActions` for simple reactive data updates
3. It passes `context` to your action so it can use the `store` and `api`
4. Its just a component so debugging and composing are 🍰

## Action API

### Action component props

- `action: Function` - _**Required**_ Function that returns a promise
- `children: Function` - _**Required**_ Function to use with the Result object (below)
- `refetchData: Array<Object>`
  - `action: Function` - Action to call after the main `action` resolves
  - `variables: Object` - Same as variables for Action or Data components
- `variables: Object` - Object to be passed to `action` like so: `action(variables)` - **Note**: you can pass an object to the `action` from the Result arguments (below) when calling, overriding this prop

### Context and Action

Whenever the `action` is called, it will receive two arguments: `variables` and `context`. Context is where the `store` and `api` live. **Please use these instead of a custom API or store instance**. By using an instance already attached to context, we can leverage the Data component to do reactive updates without any extra code.

### Result arguments

- `0: Function` - The first argument is the actionWithVariablesAndRefetch - this is what you want to call in your component
- `1: Object`:
  - `data: Object` - If the action is successful, the result is returned here
  - `loading: Boolean` - this is `true` while the action is being performed. once it is returned or an error is thrown, the value will update to `false`
  - `error: Object` - this Axios error object is returned if Axios throws an exception (404, 500, ERRCON, etc) or error thrown from a promise

## Advanced Action Usage

```jsx
import { Action, Data } from 'perch-data';
import { createNotification, getNotifications } from './myapi';

const Notifications = () => (
  <div>
    <Data action={getNotifications}>
      {({ data, error, loading }) => {
        if (loading) return <div> Loading... </div>;
        if (error) return <div> ERROR! </div>;
        if (data) return (
          <div>
            Notifications: {data.total_count}
          </div>
          <Action
            action={createNotification}
            refetchData={[{ action: getNotifications }]}
            variables={{ title: 'Hello World', color: 'red' }}
          >
            {(create, { loading }) => (
              <div>
                <button onClick={create} disabled={loading}>
                  Create Notification
                </button>
              </div>
            )}
          </Action>
        );
      }}
    </Data>
  </div>
);

Notifications.propTypes = {};

export default Notifications;
```

In the above example, calling `create()` will create a new notification and reload the list of notifications (causing the list to re-render). No logic is required to update any stores or refetch any requests - it's all automatic!
