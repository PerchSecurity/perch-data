# Cache

Cache is a set of utils for directly accessing the cache layer used by perch-data.
You can use the cache as a store for `StoreProvider` (see below) or as a standalone, promise-based store.

## Usage

```js
import { cache } from 'perch-data';

const initializeStore = () => cache.initializeStore({ apples: ['fuji'] });

const getApples = () => cache.get('apples'); // undefined if not in store and not set in initializeStore()

const setApples = () => cache.set('apples', ['fuji', 'gala', 'golden delicious']); // stored for 1 second by default

const setApplesNeverExpire = () => cache.set('apples', ['gala'], null); // null skips the 1 second default

const setApplesOneHour = () => cache.set('apples', ['golden delicious'], 60 * 60); // maxAge is counted in seconds

// getSync() and setSync() are available if a promise is not desired - usage is identical

const clearStore = () => cache.clear();
```

## API

### initializeStore( initialState )

- `initialState: Object` - key/value pairs to use as default values if the key is not found in the store

This method returns nothing

NOTES:

- These do not overwrite existing values in the store, they only are used if the key does not exist in the store
- These values are never written to the store, so they cannot be persisted across sessions

### get( cacheKey )

- `cacheKey: String` - _**required**_ - the key (id) to search the store for

This method returns a promise, and the result of the promise should be an object (best practice)

### getSync

This is identical to the `get` method, but returns the result synchronously

### set( cacheKey, value, maxAge )

- `cacheKey: String` - _**required**_ - the key (id) to save the value in the store as
- `value: Any (Object)` - _**required**_ - the data being stored - should be an object (best practice)
- `maxAge: Number` - number of seconds to keep the item in the store ( default: 1 )

This method returns a promise, and the result of the promise should be the `value`

### setSync

This is identical to the `set` method, but returns the result synchronously

### clear

This method accepts no parameters and returns nothing - but it nukes _everything_
