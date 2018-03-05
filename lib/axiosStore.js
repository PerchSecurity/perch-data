"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _store = require("store");

var _store2 = _interopRequireDefault(_store);

var _expire = require("store/plugins/expire");

var _expire2 = _interopRequireDefault(_expire);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SECOND = 1000;
var TEN_SECONDS_FROM_NOW = function TEN_SECONDS_FROM_NOW() {
  return new Date().getTime() + 10 * SECOND;
};
var PLACEHOLDER = null;

_store2.default.addPlugin(_expire2.default);

var createPlaceholder = function createPlaceholder(cacheKey) {
  return Promise.resolve(_store2.default.set(cacheKey, PLACEHOLDER, TEN_SECONDS_FROM_NOW()));
};

var axiosStore = function axiosStore(axiosInstance) {
  var reqOrCache = function reqOrCache() {
    for (var _len = arguments.length, arg = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      arg[_key - 1] = arguments[_key];
    }

    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var cacheKey = "axios__" + JSON.stringify(options);
    var cachedData = _store2.default.get(cacheKey);
    return cachedData ? Promise.resolve(_extends({}, cachedData, {
      __cacheKey: cacheKey,
      __fromCache: true
    })) : createPlaceholder(cacheKey).then(function () {
      return axiosInstance.get.apply(axiosInstance, arg);
    }).then(function (_ref) {
      var data = _ref.data;
      return _extends({}, data, { __cacheKey: cacheKey });
    }).catch(function (error) {
      if (_store2.default.get(cacheKey) === PLACEHOLDER) {
        _store2.default.remove(cacheKey);
      }
      throw error;
    });
  };

  // Check that the arguments are in the correct format
  var axiosWithCache = function axiosWithCache() {
    for (var _len2 = arguments.length, arg = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      arg[_key2] = arguments[_key2];
    }

    if (arg.length === 1 && (arg[0].method === "get" || arg[0].method === undefined)) {
      return reqOrCache.apply(undefined, [arg[0]].concat(arg));
    }
    return axiosInstance.apply(undefined, arg);
  };

  // Overwrite the get method to support cache
  axiosWithCache.get = function () {
    for (var _len3 = arguments.length, arg = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      arg[_key3] = arguments[_key3];
    }

    if (arg.length === 1) {
      return reqOrCache.apply(undefined, [{ url: arg[0] }].concat(arg));
    } else if (arg.length === 2) {
      return reqOrCache.apply(undefined, [_extends({ url: arg[0] }, arg[1])].concat(arg));
    }
    return axiosInstance.get.apply(axiosInstance, arg);
  };

  // Do NOT attempt to cache these methods
  var skipMethods = ["delete", "head", "options", "post", "put", "patch"];

  skipMethods.forEach(function (method) {
    axiosWithCache[method] = function () {
      return axiosInstance[method].apply(axiosInstance, arguments);
    };
  });

  return axiosWithCache;
};

exports.default = axiosStore;