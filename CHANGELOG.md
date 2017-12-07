# Changelog

## 0.6.0

- Add clearParams() to nuke all appliedParams
- Refactor for cleanliness

## 0.5.0

- Add applyParams method for sorting, filtering, paginating, etc
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