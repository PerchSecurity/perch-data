import store from "store";
import expirePlugin from "store/plugins/expire";
import observePlugin from "store/plugins/observe";

store.addPlugin([expirePlugin, observePlugin]);

export const set = (key, value) => {
  store.set(key, value);
};

export const unobserveData = observeId => {
    store.unobserve(observeId);
  };

export const observeData = (
  defaultKey,
  dataFn,
  onNext,
  onError,
  nocache = false
) => {
  const cachedData = store.get(defaultKey);
  if (nocache || !cachedData) {
    return dataFn()
      .then(({ cacheKey, ...data } = {}) => {
        const key = cacheKey || defaultKey;
        set(key, data);
        return store.observe(key, onNext);
      })
      .catch(onError);
  }
  onNext(cachedData);
  return Promise.resolve(store.observe(defaultKey, onNext));
};
