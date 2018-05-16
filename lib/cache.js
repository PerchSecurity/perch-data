"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.removeExpiredKeys = exports.remove = exports.unobserveData = exports.observeData = exports.clear = exports.get = exports.getSync = exports.set = exports.initializeStore = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _storeEngine = require("store/src/store-engine");

var _storeEngine2 = _interopRequireDefault(_storeEngine);

var _memoryStorage = require("store/storages/memoryStorage");

var _memoryStorage2 = _interopRequireDefault(_memoryStorage);

var _defaults = require("store/plugins/defaults");

var _defaults2 = _interopRequireDefault(_defaults);

var _expire = require("store/plugins/expire");

var _expire2 = _interopRequireDefault(_expire);

var _observePlugin = require("./observePlugin");

var _observePlugin2 = _interopRequireDefault(_observePlugin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var SECOND = 1000;

var storages = [_memoryStorage2.default];
var plugins = [_defaults2.default, _expire2.default, _observePlugin2.default];
var store = _storeEngine2.default.createStore(storages, plugins);

var defaultConfig = { maxAge: 1 };

var initializeStore = exports.initializeStore = function initializeStore() {
  var initialState = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return Promise.resolve(store.defaults(initialState));
};

var set = exports.set = function set(cacheKey, value, maxAge) {
  // Allow null to bypass default cache value and act as "never expire"
  var userMaxAgeOrDefault = maxAge || defaultConfig.maxAge;
  var existingExpiration = store.get(cacheKey) ? store.getExpiration(cacheKey) : null;
  var newExpiration = new Date().getTime() + userMaxAgeOrDefault * SECOND;
  var expiresAt = Math.max(existingExpiration, newExpiration);
  return !existingExpiration && maxAge === null ? Promise.resolve(store.set(cacheKey, value)) : Promise.resolve(store.set(cacheKey, value, expiresAt));
};

var getSync = exports.getSync = function getSync(cacheKey) {
  var result = store.get(cacheKey);
  return result && _extends({}, result, { __cacheKey: cacheKey, __fromCache: true });
};

var get = exports.get = function get(cacheKey) {
  return Promise.resolve(getSync(cacheKey));
};

var clear = exports.clear = function clear() {
  return Promise.resolve(store.clearAll());
};

var observeData = function observeData(keyName, dataFn, onNext, onError) {
  var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

  var defaultKey = "withData__" + keyName;

  var _defaultConfig$option = _extends({}, defaultConfig, options),
      maxAge = _defaultConfig$option.maxAge,
      noCache = _defaultConfig$option.noCache,
      pollInterval = _defaultConfig$option.pollInterval;

  var cachedData = keyName && store.get(defaultKey);
  var shouldUseCache = !noCache && cachedData;

  var observeKey = function observeKey(key) {
    var observableId = store.observe(key, function (data) {
      if (!(data === undefined)) {
        onNext(data);
      }
    });

    return observableId;
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
      if (!__fromCache) {
        set(key, data, maxAge);
      }
      onNext(data);
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
  } else {
    return fetchFreshData().then(function (key) {
      return { observableId: observeKey(key) };
    });
  }
};

exports.observeData = observeData;
var unobserveData = exports.unobserveData = function unobserveData(observeId) {
  return store.unobserve(observeId);
};

var remove = exports.remove = function remove(cacheKey) {
  return Promise.resolve(store.remove(cacheKey));
};

var removeExpiredKeys = exports.removeExpiredKeys = function removeExpiredKeys() {

  store.each(function (value, cacheKey) {
    var expiresAt = store.getExpiration(cacheKey);
    var now = new Date().getTime();
    if (expiresAt && expiresAt <= now) {
      store.remove(cacheKey);
    };
  });
};