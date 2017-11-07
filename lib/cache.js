"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.get = exports.set = undefined;

var _store = require("store");

var _store2 = _interopRequireDefault(_store);

var _expire = require("store/plugins/expire");

var _expire2 = _interopRequireDefault(_expire);

var _observe = require("store/plugins/observe");

var _observe2 = _interopRequireDefault(_observe);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_store2.default.addPlugin([_expire2.default, _observe2.default]);

var set = exports.set = function set(key, value) {
  _store2.default.set(key, value);
};

var get = exports.get = function get(key, dataFn, onNext, onError) {
  var nocache = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

  _store2.default.observe(key, onNext);
  var cachedData = _store2.default.get(key);
  if (nocache || !cachedData) {
    dataFn().then(function (value) {
      return set(key, value);
    }).catch(onError);
  } else {
    onNext(cachedData);
  }
};