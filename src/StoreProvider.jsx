import React from "react";
import PropTypes from "prop-types";
import { axiosStore } from "./";

class StoreProvider extends React.Component {
  getChildContext() {
    const { api, store, initialValues } = this.props;
    store.initializeStore(initialValues);
    return { api: api && axiosStore(api, store), store };
  }

  render() {
    return this.props.children;
  }
}

StoreProvider.propTypes = {
  api: PropTypes.func,
  children: PropTypes.node.isRequired,
  initialValues: PropTypes.shape({}),
  store: PropTypes.shape({
    initializeStore: PropTypes.func,
    observeData: PropTypes.func,
    unobserveData: PropTypes.func
  }).isRequired
};

StoreProvider.defaultProps = {
  api: null,
  initialValues: null
};

StoreProvider.childContextTypes = {
  api: PropTypes.func,
  store: PropTypes.object
};

export default StoreProvider;
