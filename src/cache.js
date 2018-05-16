import engine from "store/src/store-engine";
import memoryStorage from "store/storages/memoryStorage";
import defaultsPlugin from "store/plugins/defaults";
import expirePlugin from "store/plugins/expire";
import observePlugin from "./observePlugin";

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

  const observeKey = key => {
    const observableId = store.observe(key, (data) => {
      if (data === undefined) {
        console.info(`${key} removed from cache`);
      } else {
        console.info(`${key} value changed in cache: ${JSON.stringify(data)}`);
        onNext(data);
      }
    });
    console.info(`Observing ${key} with observable ID ${observableId}`);
    return observableId;
  };

  const useDataFromCache = () => {
    console.info(`Calling onNext with data from cache: ${cachedData}`);
    onNext(cachedData);
    return Promise.resolve({ observableId: observeKey(defaultKey) });
  };

  const fetchFreshData = () =>
    dataFn()
      .then(({ __cacheKey, __fromCache, ...data } = {}) => {
        const key = __cacheKey || defaultKey;
        if (!__fromCache) {
          console.info(`Setting ${JSON.stringify(key)} in cache (maxAge=${maxAge}) with fresh data: ${JSON.stringify(data)}`);
          set(key, data, maxAge);
        } else {
          console.info(`Got cached value from dataFn with cache key ${JSON.stringify(key)}: ${JSON.stringify(data)}`)
        }
        onNext(data);
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
  } else {
    return fetchFreshData().then(key => ({ observableId: observeKey(key) }));
  }
};

export const unobserveData = observeId => store.unobserve(observeId);

export const remove = cacheKey => Promise.resolve(store.remove(cacheKey));

export const removeExpiredKeys = () => {
  console.info('Removing expired keys from cache');

  store.each((value, cacheKey) => {
    const expiresAt = store.getExpiration(cacheKey);
    const now = new Date().getTime();
    if (expiresAt && expiresAt <= now) {
      console.debug(`Removing expired key ${JSON.stringify(cacheKey)}`);
      store.remove(cacheKey)
    };
  });
};
