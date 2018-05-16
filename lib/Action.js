"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Action = function (_React$Component) {
  _inherits(Action, _React$Component);

  function Action(props, context) {
    _classCallCheck(this, Action);

    var _this = _possibleConstructorReturn(this, (Action.__proto__ || Object.getPrototypeOf(Action)).call(this, props, context));

    _this.onNext = function (data) {
      if (data !== undefined) _this.setState({ data: data, loading: false });
    };

    _this.onError = function (error) {
      _this.setState({ error: error, loading: false });
    };

    _this.actionWithVariablesAndRefetch = function () {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          overrides = _ref.variables;

      var _this$props = _this.props,
          action = _this$props.action,
          refetchData = _this$props.refetchData,
          variables = _this$props.variables;

      return action(overrides || variables, _this.context).then(function (res) {
        _this.onNext(res);
        return Promise.all(refetchData.map(function (_ref2) {
          var refetchAction = _ref2.action,
              vars = _ref2.variables;
          return refetchAction(vars, _this.context);
        })).then(function () {
          return res;
        });
      }).catch(_this.onError);
    };

    _this.state = {
      data: null,
      error: null,
      loading: false
    };
    return _this;
  }

  _createClass(Action, [{
    key: "render",
    value: function render() {
      return this.props.children(this.actionWithVariablesAndRefetch, this.state);
    }
  }]);

  return Action;
}(_react2.default.Component);

Action.propTypes = {
  action: _propTypes2.default.func.isRequired,
  children: _propTypes2.default.func.isRequired,
  refetchData: _propTypes2.default.arrayOf(_propTypes2.default.shape({
    data: _propTypes2.default.func,
    variables: _propTypes2.default.object
  })),
  variables: _propTypes2.default.object // eslint-disable-line
};

Action.defaultProps = {
  refetchData: [],
  variables: {}
};

Action.contextTypes = {
  store: _propTypes2.default.object.isRequired,
  api: _propTypes2.default.func
};

exports.default = Action;