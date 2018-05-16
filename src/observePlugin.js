import eventsPlugin from 'store/plugins/events';


// store.js observe plugin which doesn't immediately invoke callback upon observing
const observePlugin = () => ({
  observe(_, key, callback) {
    return this.watch(key, callback);
  },

  unobserve(_, subId) {
    this.unwatch(subId);
  },
});

export default [eventsPlugin, observePlugin];
