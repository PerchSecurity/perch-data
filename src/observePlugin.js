import eventsPlugin from "store/plugins/events";

// store.js observe plugin which doesn't immediately invoke callback upon observing
// Original source: https://github.com/marcuswestin/store.js/blob/b8e22fea8738fc19da4d9e7dbf1cda6e5185c481/plugins/observe.js
const observePlugin = () => ({
  observe(_, key, callback) {
    return this.watch(key, callback);
  },

  unobserve(_, subId) {
    this.unwatch(subId);
  }
});

export default [eventsPlugin, observePlugin];
