"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _ = require("./");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MINUTE = 1000 * 60;

var StoreProvider = function (_React$Component) {
  _inherits(StoreProvider, _React$Component);

  function StoreProvider() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, StoreProvider);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = StoreProvider.__proto__ || Object.getPrototypeOf(StoreProvider)).call.apply(_ref, [this].concat(args))), _this), _this.state = { poll: setInterval(_this.collectGarbage, MINUTE) }, _this.collectGarbage = function () {
      var store = _this.props.store;

      if (store && store.removeExpiredKeys) store.removeExpiredKeys();
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(StoreProvider, [{
    key: "getChildContext",
    value: function getChildContext() {
      var _props = this.props,
          api = _props.api,
          store = _props.store,
          initialValues = _props.initialValues;

      store.initializeStore(initialValues);
      return { api: api && (0, _.axiosStore)(api, store), store: store };
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      if (this.state.poll) clearInterval(this.state.poll);
    }
  }, {
    key: "render",
    value: function render() {
      return this.props.children;
    }
  }]);

  return StoreProvider;
}(_react2.default.Component);

StoreProvider.propTypes = {
  api: _propTypes2.default.func,
  children: _propTypes2.default.node.isRequired,
  initialValues: _propTypes2.default.shape({}),
  store: _propTypes2.default.shape({
    initializeStore: _propTypes2.default.func,
    observeData: _propTypes2.default.func,
    removeExpiredKeys: _propTypes2.default.func,
    unobserveData: _propTypes2.default.func
  }).isRequired
};

StoreProvider.defaultProps = {
  api: null,
  initialValues: null
};

StoreProvider.childContextTypes = {
  api: _propTypes2.default.func,
  store: _propTypes2.default.object
};

exports.default = StoreProvider;