# observePlugin

Fork of store.js observe plugin which doesn't immediately invoke callback upon observing

## Original source

See the original source from Store.js [here](https://github.com/marcuswestin/store.js/blob/b8e22fea8738fc19da4d9e7dbf1cda6e5185c481/plugins/observe.js).

## Motivation

Store.js does a strange thing where it automatically invokes the onNext callback when observing a key in the store. This fork does not do that, preventing some quirky behavior.