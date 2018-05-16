import engine from "store/src/store-engine";
import memoryStorage from "store/storages/memoryStorage";
import defaultsPlugin from "store/plugins/defaults";
import expirePlugin from "store/plugins/expire";
import observePlugin from "store/plugins/observe";

const SECOND = 1000;

const storages = [memoryStorage];
const plugins = [defaultsPlugin, expirePlugin, observePlugin];
const store = engine.createStore(storages, plugins);

const defaultConfig = { maxAge: 1 };

export const initializeStore = (initialState = {}) =>
  Promise.resolve(store.defaults(initialState));

export const set = (cacheKey, value, maxAge) => {
  // Allow null to bypass default cache value and act as "never expire"
  const userMaxAgeOrDefault = maxAge || defaultConfig.maxAge;
  const existingExpiration = store.get(cacheKey)
    ? store.getExpiration(cacheKey)
    : null;
  const newExpiration = new Date().getTime() + userMaxAgeOrDefault * SECOND;
  const expiresAt = Math.max(existingExpiration, newExpiration);
  return !existingExpiration && maxAge === null
    ? Promise.resolve(store.set(cacheKey, value))
    : Promise.resolve(store.set(cacheKey, value, expiresAt));
};

export const getSync = cacheKey => {
  const result = store.get(cacheKey);
  return result && { ...result, __cacheKey: cacheKey, __fromCache: true };
};

export const get = cacheKey => Promise.resolve(getSync(cacheKey));

export const clear = () => Promise.resolve(store.clearAll());

export const observeData = (keyName, dataFn, onNext, onError, options = {}) => {
  const defaultKey = `withData__${keyName}`;
  const { maxAge, noCache, pollInterval } = { ...defaultConfig, ...options };
  const cachedData = keyName && store.get(defaultKey);
  const shouldUseCache = !noCache && cachedData;
  const observeKey = key => store.observe(key, onNext);
  const useDataFromCache = () => {
    onNext(cachedData);
    return Promise.resolve({ observableId: observeKey(defaultKey) });
  };
  const fetchFreshData = () =>
    dataFn()
      .then(({ __cacheKey, __fromCache, ...data } = {}) => {
        const key = __cacheKey || defaultKey;
        if (!__fromCache) set(key, data, maxAge);
        return key;
      })
      .catch(onError);

  if (pollInterval) {
    const poll = setInterval(() => fetchFreshData(), pollInterval * SECOND);
    return shouldUseCache
      ? useDataFromCache().then(({ observableId }) => ({ observableId, poll }))
      : fetchFreshData().then(key => ({ observableId: observeKey(key), poll }));
  } else if (shouldUseCache) {
    return useDataFromCache();
  }
  return fetchFreshData().then(key => ({ observableId: observeKey(key) }));
};

export const unobserveData = observeId => store.unobserve(observeId);

export const remove = cacheKey => Promise.resolve(store.remove(cacheKey));

export const removeExpiredKeys = () => {
  store.each((value, cacheKey) => {
    const expiresAt = store.getExpiration(cacheKey);
    const now = new Date().getTime();
    if (expiresAt && expiresAt <= now) store.remove(cacheKey);
  });
};
