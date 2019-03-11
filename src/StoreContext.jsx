import React, { createContext } from "react";
import PropTypes from "prop-types";
import { axiosStore } from "./";

const MINUTE = 1000 * 60;

export const StoreContext = createContext({});

export class StoreProvider extends React.Component {
  constructor(props) {
    super(props);
    const { api, store, initialValues } = props;
    store.initializeStore(initialValues);
    this.state = {
      api: api && axiosStore(api, store), // eslint-disable-line
      poll: setInterval(this.collectGarbage, MINUTE),
      store
    };
  }

  componentWillUnmount() {
    const { poll } = this.state;
    if (poll) clearInterval(poll);
  }

  collectGarbage = () => {
    const { store } = this.state;
    if (store && store.removeExpiredKeys) store.removeExpiredKeys();
  };

  render() {
    return (
      <StoreContext.Provider value={this.state}>
        {this.props.children}
      </StoreContext.Provider>
    );
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

export const StoreConsumer = StoreContext.Consumer;
