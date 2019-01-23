import React from "react";
import PropTypes from "prop-types";

import { StoreContext } from "./";

class Action extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      data: null,
      error: null,
      loading: false
    };
  }

  onNext = data => {
    if (data !== undefined) this.setState({ data, loading: false });
  };

  onError = error => {
    this.setState({ error, loading: false });
  };

  actionWithVariablesAndRefetch = ({ variables: overrides } = {}) => {
    const { action, refetchData, variables } = this.props;

    this.setState({ loading: true });

    return action(overrides || variables, this.context)
      .then(res => {
        this.onNext(res);
        return Promise.all(
          refetchData.map(({ action: refetchAction, variables: vars }) =>
            refetchAction(vars, this.context)
          )
        ).then(() => res);
      })
      .catch(this.onError);
  };

  render() {
    return this.props.children(this.actionWithVariablesAndRefetch, this.state);
  }
}

Action.contextType = StoreContext;

Action.propTypes = {
  action: PropTypes.func.isRequired,
  children: PropTypes.func.isRequired,
  refetchData: PropTypes.arrayOf(
    PropTypes.shape({
      data: PropTypes.func,
      variables: PropTypes.object
    })
  ),
  variables: PropTypes.object // eslint-disable-line
};

Action.defaultProps = {
  refetchData: [],
  variables: {}
};

export default Action;
