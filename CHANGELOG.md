# Changelog

## 0.19.1

- Fixes an issue where repeat calls to a single data component could cause out of order renders
- Adds logging in dev ( TODO: replace with cross-repo logging solution )
- Changes lint rule for if / else blocks

## 0.19.0

- Switch to an in-memory store (from localstorage)

## 0.18.0

- Rename `data` => `action` for refetchActions

## 0.17.1

- Fix for initialization syntax

## 0.17.0

- Add garbage collection to StoreProvider and cache.js

## 0.16.1

- Ignore falsy / duplicate values for Data's onNext event
- Only keep existing cache key maxAge if valid and larger than specified

## 0.16.0

- Add Action component
- Add `api` prop to StoreProvider, which makes API available via context
- Add context to actions called by Data
- Add 'remove' method to cache.js
- Add logic to respect existing `maxAge`s when setting the cache
- Refactor axiosStore.js to accept a store or default to a new instance of cache.js

## 0.15.1

- Add a guard against undefined data updates
- Ensure refetch never hits the cache

## 0.15.0

- Add `cache.initializeStore()` to handle default store values
- Add `initialValues` prop to `StoreProvider` to leverage `cache.initializeStore()`
- Remove the `defaultValue` argument from `cache.get()`
- Convert Boolean responses to objects with `value` property
- Update docs and add cache docs
- Update dependencies

## 0.14.0

- Allow `null` maxAge to never expire a key

## 0.13.2

- Convert Number responses to objects with `value` property

## 0.13.1

- Convert String responses to objects with `value` property

## 0.13.0

- Convert array responses into objects with `results` arrays

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