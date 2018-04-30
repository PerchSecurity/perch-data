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
      poll: null
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
    if (data !== undefined) this.setState({ data, loading: false });
  };

  onError = error => {
    this.setState({ error, loading: false });
  };

  fetchData = () => {
    const { action, options, variables } = this.props;
    const { store } = this.context;
    const actionWithVariables = () => action(variables);
    this.setState({ loading: true });
    store
      .observeData(
        null,
        actionWithVariables,
        this.onNext,
        this.onError,
        options
      )
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
    return this.props.children({ ...this.state, refetch: this.fetchData });
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
  store: PropTypes.shape({
    observeData: PropTypes.func,
    unobserveData: PropTypes.func
  }).isRequired
};

export default Data;
