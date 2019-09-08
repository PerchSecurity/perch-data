const PLACEHOLDER = null;

const defaultCallback = data => data;

const axiosStore = (axiosInstance, store) => {
  const createPlaceholder = cacheKey => store.set(cacheKey, PLACEHOLDER, 10);

  const reqOrCache = (options = {}, ...arg) => {
    const { callback = defaultCallback, ...axiosOptions } = options;
    const cacheKey = `axios__${JSON.stringify(axiosOptions)}`;
    const cachedData = store.getSync(cacheKey);

    return cachedData !== undefined
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

            return wrappedData;
          })
          .then(normalizedData => callback(normalizedData))
          .then(processedData => store.set(cacheKey, processedData))
          .then(data => ({ ...data, __cacheKey: cacheKey, __fromCache: false }))
          .catch(error => {
            if (store.getSync(cacheKey) === PLACEHOLDER) store.remove(cacheKey);
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
