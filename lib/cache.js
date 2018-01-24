"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.unobserveData = exports.observeData = exports.clear = exports.get = exports.getSync = exports.set = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _store = require("store");

var _store2 = _interopRequireDefault(_store);

var _expire = require("store/plugins/expire");

var _expire2 = _interopRequireDefault(_expire);

var _observe = require("store/plugins/observe");

var _observe2 = _interopRequireDefault(_observe);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var SECOND = 1000;

_store2.default.addPlugin([_expire2.default, _observe2.default]);

var defaultConfig = { maxAge: 1 };

var set = exports.set = function set(key, value) {
  var maxAge = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : defaultConfig.maxAge;

  var expiresAt = new Date().getTime() + maxAge * SECOND;
  return Promise.resolve(_store2.default.set(key, value, expiresAt));
};

var getSync = exports.getSync = function getSync(cacheKey, defaultValue) {
  var result = _store2.default.get(cacheKey) || defaultValue;
  return _extends({}, result, { __cacheKey: cacheKey });
};

var get = exports.get = function get(cacheKey, defaultValue) {
  return Promise.resolve(getSync(cacheKey, defaultValue));
};

var clear = exports.clear = function clear() {
  return _store2.default.clearAll();
};

var observeData = function observeData(actionName, dataFn, onNext, onError) {
  var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

  var defaultKey = "withData__" + actionName;

  var _defaultConfig$option = _extends({}, defaultConfig, options),
      maxAge = _defaultConfig$option.maxAge,
      noCache = _defaultConfig$option.noCache,
      pollInterval = _defaultConfig$option.pollInterval;

  var cachedData = _store2.default.get(defaultKey);
  var shouldUseCache = !noCache && cachedData;
  var useDataFromCache = function useDataFromCache() {
    onNext(cachedData);
    return Promise.resolve(_store2.default.observe(defaultKey, onNext));
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
    return shouldUseCache ? useDataFromCache().then(function (observeId) {
      return [observeId, poll];
    }) : fetchFreshData().then(function (key) {
      return [_store2.default.observe(key, onNext), poll];
    });
  } else if (shouldUseCache) {
    return useDataFromCache();
  }
  return fetchFreshData().then(function (key) {
    return _store2.default.observe(key, onNext);
  });
};

exports.observeData = observeData;
var unobserveData = exports.unobserveData = function unobserveData(observeId) {
  _store2.default.unobserve(observeId);
};