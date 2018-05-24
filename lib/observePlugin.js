"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _events = require("store/plugins/events");

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// store.js observe plugin which doesn't immediately invoke callback upon observing
// Original source: https://github.com/marcuswestin/store.js/blob/b8e22fea8738fc19da4d9e7dbf1cda6e5185c481/plugins/observe.js
var observePlugin = function observePlugin() {
  return {
    observe: function observe(_, key, callback) {
      return this.watch(key, callback);
    },
    unobserve: function unobserve(_, subId) {
      this.unwatch(subId);
    }
  };
};

exports.default = [_events2.default, observePlugin];