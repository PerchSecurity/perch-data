import store from "store";
import expirePlugin from "store/plugins/expire";
import observePlugin from "store/plugins/observe";

const SECOND = 1000;

store.addPlugin([expirePlugin, observePlugin]);

const defaultConfig = { maxAge: 1, noCache: true };

export const set = (key, value, maxAge = defaultConfig.maxAge) => {
  const expiresAt = new Date().getTime() + (maxAge * SECOND);
  store.set(key, value, expiresAt);
};

export const observeData = (
  defaultKey,
  dataFn,
  onNext,
  onError,
  options = {}
) => {
  const { maxAge, noCache, pollInterval } = { ...defaultConfig, ...options };
  const cachedData = store.get(defaultKey);
  const shouldUseCache = !noCache && cachedData;
  const useDataFromCache = () => {
    onNext(cachedData);
    return Promise.resolve(store.observe(defaultKey, onNext));
  };
  const fetchFreshData = () =>
    dataFn()
      .then(({ cacheKey, fromCache, ...data } = {}) => {
        const key = cacheKey || defaultKey;
        if (!fromCache) set(key, data, maxAge);
        return key;
      })
      .catch(onError);

  if (pollInterval) {
    const poll = setInterval(() => fetchFreshData(), pollInterval * SECOND);
    return shouldUseCache
      ? useDataFromCache().then(observeId => [observeId, poll])
      : fetchFreshData().then(key => [store.observe(key, onNext), poll]);
  } else if (shouldUseCache) {
    return useDataFromCache();
  }
  return fetchFreshData().then(key => store.observe(key, onNext));
};

export const unobserveData = observeId => {
  store.unobserve(observeId);
};
