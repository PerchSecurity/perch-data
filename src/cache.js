import store from "store";
import expirePlugin from "store/plugins/expire";
import observePlugin from "store/plugins/observe";

store.addPlugin([expirePlugin, observePlugin]);

export const set = (key, value) => {
  store.set(key, value);
};

export const get = (key, dataFn, onNext, onError, nocache = false) => {
  store.observe(key, onNext);
  const cachedData = store.get(key);
  if (nocache || !cachedData) {
    dataFn()
      .then(value => set(key, value))
      .catch(onError);
  } else {
    onNext(cachedData);
  }
};
