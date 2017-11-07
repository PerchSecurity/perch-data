import React from "react";
import update from "immutability-helper";
import { get as fromCache } from "./cache";

function withData(actions) {
  function enhance(WrappedComponent) {
    return class extends React.Component {
      constructor(props) {
        super(props);

        // Set all queries to { loading: true, refetch: getData() }
        const data = {};
        const actionNames = Object.keys(actions);
        actionNames.forEach(actionName => {
          data[actionName] = {
            loading: true,
            refetch: () => this.getData(actionName, { nocache: true })
          };
        });
        this.state = { data };
      }

      goToPage = (actionName, page) => {
        this.setState(
          prevState =>
            update(prevState, {
              data: { [actionName]: { loading: { $set: true } } }
            }),
          this.getData(actionName, { page })
        );
      };

      onNext = (actionName, data) => {
        // Set data[actionName] from { loading: false } + the result of the request
        const loading = false;
        const goToPage = page => this.goToPage(actionName, page);
        this.setState(prevState =>
          update(prevState, {
            data: {
              [actionName]: { $merge: { loading, goToPage, ...data } }
            }
          })
        );
      };

      onError = (actionName, error) => {
        // Set data[actionName] from { loading: false } + the { error } generated by Axios
        const loading = false;
        const isAxiosError = Object.keys(error).includes("request"); // crude, but works
        if (isAxiosError) {
          this.setState(prevState =>
            update(prevState, {
              data: {
                [actionName]: { $merge: { loading, error } }
              }
            })
          );
        } else {
          throw error;
        }
      };

      getData = (actionName, options) => {
        const mergedOptions = Object.assign({}, this.props, options);
        fromCache(
          actionName,
          () => actions[actionName](mergedOptions),
          data => this.onNext(actionName, data),
          error => this.onError(actionName, error),
          mergedOptions.nocache
        );
      };

      componentDidMount() {
        // Request data for each query
        const actionNames = Object.keys(actions);
        actionNames.forEach(actionName => this.getData(actionName));
      }

      render() {
        return <WrappedComponent data={this.state.data} {...this.props} />;
      }
    };
  }

  return enhance;
}

export default withData;
