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

_store2.default.addPlugin([_expire2.default, _observe2.default]);

var SECOND = 1000;
var DEFAULT_MAXAGE = 60 * SECOND;

var set = exports.set = function set(key, value) {
  var maxAge = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : DEFAULT_MAXAGE;

  var expiresAt = new Date().getTime() + maxAge;
  _store2.default.set(key, value, expiresAt);
};

var observeData = function observeData(defaultKey, dataFn, onNext, onError) {
  var _ref = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {},
      maxAge = _ref.maxAge,
      noCache = _ref.noCache,
      pollInterval = _ref.pollInterval;

  var cachedData = _store2.default.get(defaultKey);
  var shouldUseCache = !noCache && cachedData;
  var useDataFromCache = function useDataFromCache() {
    onNext(cachedData);
    return Promise.resolve(_store2.default.observe(defaultKey, onNext));
  };
  var fetchFreshData = function fetchFreshData() {
    return dataFn().then(function () {
      var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var cacheKey = _ref2.cacheKey,
          fromCache = _ref2.fromCache,
          data = _objectWithoutProperties(_ref2, ["cacheKey", "fromCache"]);

      var key = cacheKey || defaultKey;
      if (!fromCache) set(key, data, maxAge);
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