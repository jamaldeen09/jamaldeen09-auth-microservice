// ** Imports ** \\
import { cacheStore } from "../server.js";
// ** Custom function to store items in cache ** \\
const writeOperation = (cacheKey, cacheValue) => {
    cacheStore.set(cacheKey, JSON.stringify(cacheValue));
    return;
};
const readOperation = (cacheKey) => {
    const cachedItem = cacheStore.get(cacheKey);
    return cachedItem;
};
const deleteOperation = (cacheKey) => {
    cacheStore.delete(cacheKey);
    return;
};
export { writeOperation, readOperation, deleteOperation };
//# sourceMappingURL=cache.services.js.map