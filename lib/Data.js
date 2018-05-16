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

    _initialiseProps.call(_this);

    _this.state = {
      data: null,
      error: null,
      loading: true,
      observableId: null,
      poll: null,
      fetchCount: 0
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
      var _this2 = this;

      return this.props.children(_extends({}, this.state, {
        refetch: function refetch() {
          return _this2.fetchData({ noCache: true });
        }
      }));
    }
  }]);

  return Data;
}(_react2.default.Component);

var _initialiseProps = function _initialiseProps() {
  var _this3 = this;

  this.onNext = function (data) {
    if (data) {
      if (!(0, _lodash2.default)(data, _this3.state.data)) {
        _this3.setState({ data: data, loading: false });
      } else {
        _this3.setState({ loading: false });
      }
    }
  };

  this.onError = function (error) {
    _this3.setState({ error: error, loading: false });
  };

  this.fetchData = function (overrides) {
    _this3.setState(function (prevState, props) {
      var action = props.action,
          options = props.options,
          variables = props.variables;
      var store = _this3.context.store;

      var fetchCount = prevState.fetchCount + 1;

      // Creates a callback which only completes if fetchData hasn't been called
      // again in the meantime
      var makeCallback = function makeCallback(fn) {
        return function () {
          if (_this3.state.fetchCount === fetchCount) fn.apply(undefined, arguments);
        };
      };
      var actionWithVariables = function actionWithVariables() {
        return action(variables, _this3.context);
      };

      store.observeData(null, actionWithVariables, makeCallback(_this3.onNext), makeCallback(_this3.onError), _extends({}, options, overrides)).then(function (_ref) {
        var observableId = _ref.observableId,
            poll = _ref.poll;

        // Stop listening to the old data if it does not have the same id
        if (_this3.state.observableId && observableId !== _this3.state.observableId) {
          store.unobserveData(_this3.state.observableId);
        }
        if (_this3.state.poll && poll !== _this3.state.poll) {
          clearInterval(_this3.state.poll);
        }
        _this3.setState({ observableId: observableId, poll: poll });
      });

      return {
        loading: true,
        fetchCount: fetchCount
      };
    });
  };
};

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
  api: _propTypes2.default.func,
  store: _propTypes2.default.shape({
    observeData: _propTypes2.default.func,
    unobserveData: _propTypes2.default.func
  }).isRequired
};

exports.default = Data;