import storejs from "store";
import expirePlugin from "store/plugins/expire";

storejs.addPlugin(expirePlugin);

const SECOND = 1000;
const TEN_SECONDS_FROM_NOW = () => new Date().getTime() + 10 * SECOND;
const PLACEHOLDER = null;

const axiosStore = (axiosInstance, store) => {
  const createPlaceholder = cacheKey =>
    store
      ? store.set(cacheKey, PLACEHOLDER, TEN_SECONDS_FROM_NOW())
      : Promise.resolve(
          storejs.set(cacheKey, PLACEHOLDER, TEN_SECONDS_FROM_NOW())
        );

  const reqOrCache = (options = {}, ...arg) => {
    const cacheKey = `axios__${JSON.stringify(options)}`;
    const cachedData = store ? store.getSync(cacheKey) : storejs.get(cacheKey);
    return cachedData
      ? Promise.resolve({
          ...cachedData,
          __cacheKey: cacheKey,
          __fromCache: true
        })
      : createPlaceholder(cacheKey)
          .then(() => axiosInstance.get(...arg))
          .then(({ data }) => {
            let wrappedData = {};
            if (Array.isArray(data)) {
              wrappedData = { results: data };
            } else if (
              typeof data === "string" ||
              typeof data === "number" ||
              typeof data === "boolean"
            ) {
              wrappedData = { value: data };
            } else {
              wrappedData = data;
            }
            return { ...wrappedData, __cacheKey: cacheKey };
          })
          .catch(error => {
            if (store && store.getSync(cacheKey) === PLACEHOLDER) {
              store.remove(cacheKey);
            } else if (!store && storejs.get(cacheKey) === PLACEHOLDER) {
              storejs.remove(cacheKey);
            }
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
