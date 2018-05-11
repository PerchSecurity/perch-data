"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.removeExpiredKeys = exports.remove = exports.unobserveData = exports.observeData = exports.clear = exports.get = exports.getSync = exports.set = exports.initializeStore = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _store = require("store");

var _store2 = _interopRequireDefault(_store);

var _defaults = require("store/plugins/defaults");

var _defaults2 = _interopRequireDefault(_defaults);

var _expire = require("store/plugins/expire");

var _expire2 = _interopRequireDefault(_expire);

var _observe = require("store/plugins/observe");

var _observe2 = _interopRequireDefault(_observe);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var SECOND = 1000;

_store2.default.addPlugin([_defaults2.default, _expire2.default, _observe2.default]);

var defaultConfig = { maxAge: 1 };

var initializeStore = exports.initializeStore = function initializeStore() {
  var initialState = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return Promise.resolve(_store2.default.defaults(initialState));
};

var set = exports.set = function set(cacheKey, value, maxAge) {
  // Allow null to bypass default cache value and act as "never expire"
  var userMaxAgeOrDefault = maxAge || defaultConfig.maxAge;
  var existingExpiration = _store2.default.get(cacheKey) ? _store2.default.getExpiration(cacheKey) : null;
  var newExpiration = new Date().getTime() + userMaxAgeOrDefault * SECOND;
  var expiresAt = Math.max(existingExpiration, newExpiration);
  return !existingExpiration && maxAge === null ? Promise.resolve(_store2.default.set(cacheKey, value)) : Promise.resolve(_store2.default.set(cacheKey, value, expiresAt));
};

var getSync = exports.getSync = function getSync(cacheKey) {
  var result = _store2.default.get(cacheKey);
  return result && _extends({}, result, { __cacheKey: cacheKey, __fromCache: true });
};

var get = exports.get = function get(cacheKey) {
  return Promise.resolve(getSync(cacheKey));
};

var clear = exports.clear = function clear() {
  return Promise.resolve(_store2.default.clearAll());
};

var observeData = function observeData(keyName, dataFn, onNext, onError) {
  var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

  var defaultKey = "withData__" + keyName;

  var _defaultConfig$option = _extends({}, defaultConfig, options),
      maxAge = _defaultConfig$option.maxAge,
      noCache = _defaultConfig$option.noCache,
      pollInterval = _defaultConfig$option.pollInterval;

  var cachedData = keyName && _store2.default.get(defaultKey);
  var shouldUseCache = !noCache && cachedData;
  var observeKey = function observeKey(key) {
    return _store2.default.observe(key, onNext);
  };
  var useDataFromCache = function useDataFromCache() {
    onNext(cachedData);
    return Promise.resolve({ observableId: observeKey(defaultKey) });
  };
  var fetchFreshData = function fetchFreshData() {
    return dataFn().then(function () {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var __cacheKey = _ref.__cacheKey,
          __fromCache = _ref.__fromCache,
          data = _objectWithoutProperties(_ref, ["__cacheKey", "__fromCache"]);

      var key = __cacheKey || defaultKey;
      if (!__fromCache) set(key, data, maxAge);
      return key;
    }).catch(onError);
  };

  if (pollInterval) {
    var poll = setInterval(function () {
      return fetchFreshData();
    }, pollInterval * SECOND);
    return shouldUseCache ? useDataFromCache().then(function (_ref2) {
      var observableId = _ref2.observableId;
      return { observableId: observableId, poll: poll };
    }) : fetchFreshData().then(function (key) {
      return { observableId: observeKey(key), poll: poll };
    });
  } else if (shouldUseCache) {
    return useDataFromCache();
  }
  return fetchFreshData().then(function (key) {
    return { observableId: observeKey(key) };
  });
};

exports.observeData = observeData;
var unobserveData = exports.unobserveData = function unobserveData(observeId) {
  return _store2.default.unobserve(observeId);
};

var remove = exports.remove = function remove(cacheKey) {
  return Promise.resolve(_store2.default.remove(cacheKey));
};

var removeExpiredKeys = exports.removeExpiredKeys = function removeExpiredKeys() {
  _store2.default.each(function (value, cacheKey) {
    var expiresAt = _store2.default.getExpiration(cacheKey);
    var now = new Date().getTime();
    if (expiresAt && expiresAt <= now) _store2.default.remove(cacheKey);
  });
};