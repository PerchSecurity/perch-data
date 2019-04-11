# axiosStore

axiosStore is a light wrapper around axios that allows for caching get requests using `cache.js`.

**NOTE:** As of v0.13.0 all array responses will instead return an object with a `results` array.

**NOTE:** As of v0.13.1 all string responses will instead return an object with a `value prop.

**NOTE:** As of v0.13.2 all number responses will instead return an object with a `value` prop.

**NOTE:** As of v0.15.0 all boolean responses will instead return an object with a `value` prop.

Example:

```js
APIResponse = [ 0, 2, 4, 6, 8 ]; // => { results: [ 0, 2, 4, 6, 8 ] }

APIResponse = 'foobar'; // => { value: 'foobar' }

APIResponse = 47; // => { value: 47 }

APIResponse = true; // => { value: true }
```

## Formatting responses

If you would like to format the response you should use a callback prop as such:

```js
const myAction = ({ id }, { api }) => {
  // This function takes the response and expects you to return an augmented response
  const formatResponse = response => ({
    ...response,
    customNode: "this is data the API did not include, so adding it here"
  });

  // Pass it to the axios instance with `callback`
  return api.get(`apiRoot/myEndpoint/${id}`, { callback: formatResponse });
}
```
