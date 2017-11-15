import store from "store";
import expirePlugin from "store/plugins/expire";
import observePlugin from "store/plugins/observe";

const SECOND = 1000;
const DEFAULT_MAXAGE = 60 * SECOND;

store.addPlugin([expirePlugin, observePlugin]);

export const set = (key, value, maxAge = DEFAULT_MAXAGE) => {
  const expiresAt = new Date().getTime() + maxAge;
  store.set(key, value, expiresAt);
};

export const observeData = (
  defaultKey,
  dataFn,
  onNext,
  onError,
  { maxAge, noCache } = {}
) => {
  const cachedData = store.get(defaultKey);
  if (noCache || !cachedData) {
    return dataFn()
      .then(({ cacheKey, ...data } = {}) => {
        const key = cacheKey || defaultKey;
        set(key, data, maxAge);
        return store.observe(key, onNext);
      })
      .catch(onError);
  }
  onNext(cachedData);
  return Promise.resolve(store.observe(defaultKey, onNext));
};

export const unobserveData = observeId => {
  store.unobserve(observeId);
};
