import React from "react";
import PropTypes from "prop-types";
import isEqual from "lodash.isequal";

class Data extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      data: null,
      error: null,
      loading: true,
      observableId: null,
      poll: null,
      fetchCount: 0
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    if (!isEqual(this.props.variables, prevProps.variables)) {
      this.fetchData();
    }
  }

  componentWillUnmount() {
    const { observableId, poll } = this.state;
    const { store } = this.context;
    if (observableId) store.unobserveData(observableId);
    if (poll) clearInterval(poll);
  }

  onNext = data => {
    if (data) {
      if (!isEqual(data, this.state.data)) {
        this.setState({ data, loading: false });
      } else {
        this.setState({ loading: false });
      }
    }
  };

  onError = error => {
    this.setState({ error, loading: false });
  };

  fetchData = overrides => {
    const { action, options, variables } = this.props;
    const { store } = this.context;
    const fetchCount = this.state.fetchCount + 1;

    // Creates a callback which only completes if fetchData hasn't been called
    // again in the meantime
    const makeCallback = (fn) => (...args) => {
      if (this.state.fetchCount === fetchCount) fn(...args);
    };
    const actionWithVariables = () => action(variables, this.context);

    this.setState({ loading: true, fetchCount });

    store
      .observeData(null, actionWithVariables, makeCallback(this.onNext), makeCallback(this.onError), {
        ...options,
        ...overrides
      })
      .then(({ observableId, poll }) => {
        // Stop listening to the old data if it does not have the same id
        if (
          this.state.observableId &&
          observableId !== this.state.observableId
        ) {
          store.unobserveData(this.state.observableId);
        }
        if (this.state.poll && poll !== this.state.poll) {
          clearInterval(this.state.poll);
        }
        this.setState({ observableId, poll });
      });
  };

  render() {
    return this.props.children({
      ...this.state,
      refetch: () => this.fetchData({ noCache: true })
    });
  }
}

Data.propTypes = {
  action: PropTypes.func.isRequired,
  children: PropTypes.func.isRequired,
  options: PropTypes.shape({
    pollInterval: PropTypes.number,
    maxAge: PropTypes.number
  }),
  variables: PropTypes.object // eslint-disable-line
};

Data.defaultProps = {
  options: {},
  variables: {}
};

Data.contextTypes = {
  api: PropTypes.func,
  store: PropTypes.shape({
    observeData: PropTypes.func,
    unobserveData: PropTypes.func
  }).isRequired
};

export default Data;
