import React from "react";
import PropTypes from "prop-types";

class StoreProvider extends React.Component {
  getChildContext() {
    const { store, initialValues } = this.props;
    store.initializeStore(initialValues);
    return { store };
  }

  render() {
    return this.props.children;
  }
}

StoreProvider.propTypes = {
  children: PropTypes.node.isRequired,
  initialValues: PropTypes.shape({}),
  store: PropTypes.shape({
    initializeStore: PropTypes.func,
    observeData: PropTypes.func,
    unobserveData: PropTypes.func
  }).isRequired
};

StoreProvider.defaultProps = {
  initialValues: null
};

StoreProvider.childContextTypes = {
  store: PropTypes.object
};

export default StoreProvider;
