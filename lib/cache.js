"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.unobserveData = exports.observeData = exports.set = undefined;

var _store = require("store");

var _store2 = _interopRequireDefault(_store);

var _expire = require("store/plugins/expire");

var _expire2 = _interopRequireDefault(_expire);

var _observe = require("store/plugins/observe");

var _observe2 = _interopRequireDefault(_observe);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var SECOND = 1000;
var DEFAULT_MAXAGE = 60 * SECOND;

_store2.default.addPlugin([_expire2.default, _observe2.default]);

var set = exports.set = function set(key, value) {
  var maxAge = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : DEFAULT_MAXAGE;

  var expiresAt = new Date().getTime() + maxAge;
  _store2.default.set(key, value, expiresAt);
};

var observeData = function observeData(defaultKey, dataFn, onNext, onError) {
  var _ref = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {},
      maxAge = _ref.maxAge,
      noCache = _ref.noCache;

  var cachedData = _store2.default.get(defaultKey);
  if (noCache || !cachedData) {
    return dataFn().then(function () {
      var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var cacheKey = _ref2.cacheKey,
          data = _objectWithoutProperties(_ref2, ["cacheKey"]);

      var key = cacheKey || defaultKey;
      set(key, data, maxAge);
      return _store2.default.observe(key, onNext);
    }).catch(onError);
  }
  onNext(cachedData);
  return Promise.resolve(_store2.default.observe(defaultKey, onNext));
};

exports.observeData = observeData;
var unobserveData = exports.unobserveData = function unobserveData(observeId) {
  _store2.default.unobserve(observeId);
};