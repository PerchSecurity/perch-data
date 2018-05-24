import eventsPlugin from "store/plugins/events";

const observePlugin = () => ({
  observe(_, key, callback) {
    return this.watch(key, callback);
  },

  unobserve(_, subId) {
    this.unwatch(subId);
  }
});

export default [eventsPlugin, observePlugin];
