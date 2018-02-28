import store from "store";
import expirePlugin from "store/plugins/expire";
import isEqual from "lodash.isequal";

const SECOND = 1000;
const TEN_SECONDS_FROM_NOW = () => new Date().getTime() + 10 * SECOND;
const PLACEHOLDER = { loading: true };

store.addPlugin(expirePlugin);

const createPlaceholder = cacheKey =>
  Promise.resolve(store.set(cacheKey, PLACEHOLDER, TEN_SECONDS_FROM_NOW()));

const axiosStore = axiosInstance => {
  const reqOrCache = (options = {}, ...arg) => {
    const cacheKey = `axios__${JSON.stringify(options)}`;
    const cachedData = store.get(cacheKey);
    return cachedData
      ? Promise.resolve({
          ...cachedData,
          __cacheKey: cacheKey,
          __fromCache: true
        })
      : createPlaceholder(cacheKey)
          .then(() => axiosInstance.get(...arg))
          .then(({ data }) => ({ ...data, __cacheKey: cacheKey }))
          .catch(error => {
            if (isEqual(store.get(cacheKey), PLACEHOLDER))
              store.remove(cacheKey);
            throw error;
          });
  };

  // Check that the arguments are in the correct format
  const axiosWithCache = (...arg) => {
    if (
      arg.length === 1 &&
      (arg[0].method === "get" || arg[0].method === undefined)
    ) {
      return reqOrCache(arg[0], ...arg);
    }
    return axiosInstance(...arg);
  };

  // Overwrite the get method to support cache
  axiosWithCache.get = (...arg) => {
    if (arg.length === 1) {
      return reqOrCache({ url: arg[0] }, ...arg);
    } else if (arg.length === 2) {
      return reqOrCache({ url: arg[0], ...arg[1] }, ...arg);
    }
    return axiosInstance.get(...arg);
  };

  // Do NOT attempt to cache these methods
  const skipMethods = ["delete", "head", "options", "post", "put", "patch"];

  skipMethods.forEach(method => {
    axiosWithCache[method] = (...arg) => axiosInstance[method](...arg);
  });

  return axiosWithCache;
};

export default axiosStore;
