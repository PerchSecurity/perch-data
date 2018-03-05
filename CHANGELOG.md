# Changelog

## 0.12.0

- Add Data component
- Add StoreProvider for a centralized, observable application store
- Fix and upgrade ESLint
- Update docs
- Refactor placeholder from `{ loading: true }` to `null`
- Refactor deps to use modular lodash
- Refactor cache promise signature

## 0.11.0

- Add axiosStore from usePF/axios-store-plugin

## 0.10.0

- Rename `perch-data`
- Remove default export, `withData` is now a named export

## 0.9.2

- Fix `cache.clear()` to return a promise
- Return `undefined` when the cache has no results for a given key

## 0.9.1

- Set `__fromCache = true` when returning results from cache
- Return `null` when the cache has no results for a given key

## 0.9.0

- Add new `cache` utilities for working directly with the store (`get`, `getSync`, `set`, `clear`)

## 0.8.0

- BREAKING: Rename `fromCache` and `cacheKey` to `__fromCache` and `__cacheKey` to prevent collisions with fetched data
- Add support for pending actions #15
- Prefix cache entries with `withData__`

## 0.7.0

- Add `optimisticUpdate()` to rerender with data

## 0.6.0

- Add `clearParams()` to nuke all appliedParams
- Refactor for cleanliness

## 0.5.0

- Add `applyParams()` method for sorting, filtering, paginating, etc
- Fix bug with `setState` callback (using `ComponendDidUpdate` as temp fix)
- Remove `goToPage()` in favor of `applyParams()`

## 0.4.0

- Refactor default cache maxAge to `1 second`
- Add and remove support for cosmiconfig because of webpack issues

## 0.3.0

- Add `pollInterval` option for polling an entity until unmount
- Fix caching issue

## 0.2.0

- Add caching via [store.js](https://github.com/marcuswestin/store.js/)
- Add entity-level cache configuration
- Refactor `withData()` to observe and re-render data from cache

## 0.1.0

- Create and release withData() HOC
- Add support for `refetch()` -ing data
- Add `goToPage()` for paginating data
- Add `loading` and `error` properties to each entity requested
- Add docs