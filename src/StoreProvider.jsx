import React from "react";
import PropTypes from "prop-types";

class StoreProvider extends React.Component {
  getChildContext() {
    const { store } = this.props;
    return { store };
  }

  render() {
    return this.props.children;
  }
}

StoreProvider.propTypes = {
  children: PropTypes.node.isRequired,
  store: PropTypes.shape({
    observeData: PropTypes.func,
    unobserveData: PropTypes.func
  }).isRequired
};

StoreProvider.childContextTypes = {
  store: PropTypes.object
};

export default StoreProvider;
