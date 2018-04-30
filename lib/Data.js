"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _lodash = require("lodash.isequal");

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Data = function (_React$Component) {
  _inherits(Data, _React$Component);

  function Data(props, context) {
    _classCallCheck(this, Data);

    var _this = _possibleConstructorReturn(this, (Data.__proto__ || Object.getPrototypeOf(Data)).call(this, props, context));

    _this.onNext = function (data) {
      if (data !== undefined) _this.setState({ data: data, loading: false });
    };

    _this.onError = function (error) {
      _this.setState({ error: error, loading: false });
    };

    _this.fetchData = function () {
      var _this$props = _this.props,
          action = _this$props.action,
          options = _this$props.options,
          variables = _this$props.variables;
      var store = _this.context.store;

      var actionWithVariables = function actionWithVariables() {
        return action(variables);
      };
      _this.setState({ loading: true });
      store.observeData(null, actionWithVariables, _this.onNext, _this.onError, options).then(function (_ref) {
        var observableId = _ref.observableId,
            poll = _ref.poll;

        // Stop listening to the old data if it does not have the same id
        if (_this.state.observableId && observableId !== _this.state.observableId) {
          store.unobserveData(_this.state.observableId);
        }
        if (_this.state.poll && poll !== _this.state.poll) {
          clearInterval(_this.state.poll);
        }
        _this.setState({ observableId: observableId, poll: poll });
      });
    };

    _this.state = {
      data: null,
      error: null,
      loading: true,
      observableId: null,
      poll: null
    };
    return _this;
  }

  _createClass(Data, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.fetchData();
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps) {
      if (!(0, _lodash2.default)(this.props.variables, prevProps.variables)) {
        this.fetchData();
      }
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      var _state = this.state,
          observableId = _state.observableId,
          poll = _state.poll;
      var store = this.context.store;

      if (observableId) store.unobserveData(observableId);
      if (poll) clearInterval(poll);
    }
  }, {
    key: "render",
    value: function render() {
      return this.props.children(_extends({}, this.state, { refetch: this.fetchData }));
    }
  }]);

  return Data;
}(_react2.default.Component);

Data.propTypes = {
  action: _propTypes2.default.func.isRequired,
  children: _propTypes2.default.func.isRequired,
  options: _propTypes2.default.shape({
    pollInterval: _propTypes2.default.number,
    maxAge: _propTypes2.default.number
  }),
  variables: _propTypes2.default.object // eslint-disable-line
};

Data.defaultProps = {
  options: {},
  variables: {}
};

Data.contextTypes = {
  store: _propTypes2.default.shape({
    observeData: _propTypes2.default.func,
    unobserveData: _propTypes2.default.func
  }).isRequired
};

exports.default = Data;