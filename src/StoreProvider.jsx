import React from "react";
import PropTypes from "prop-types";
import { axiosStore } from "./";

const MINUTE = 1000 * 60;

class StoreProvider extends React.Component {
  constructor(props) {
    super(props);
    this.state = { poll: setInterval(this.collectGarbage, MINUTE) };
  }

  getChildContext() {
    const { api, store, initialValues } = this.props;
    store.initializeStore(initialValues);
    return { api: api && axiosStore(api, store), store };
  }

  componentWillUnmount() {
    if (this.state.poll) clearInterval(this.state.poll);
  }

  collectGarbage = () => {
    const { store } = this.props;
    if (store && store.removeExpiredKeys) store.removeExpiredKeys();
  };

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
    removeExpiredKeys: PropTypes.func,
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
