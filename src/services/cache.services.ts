// ** Imports ** \\
import { cacheStore } from "../server.js"

// ** Custom function to store items in cache ** \\
const writeOperation = <T>(
    cacheKey: string,
    cacheValue: T
) => {
    cacheStore.set(cacheKey, JSON.stringify(cacheValue));
    return;
}

const readOperation = (
    cacheKey: string,
) => {
    const cachedItem = cacheStore.get(cacheKey);
    return cachedItem
}

const deleteOperation = (
    cacheKey: string,

) => {
    cacheStore.delete(cacheKey);
    return;
}


export {
    writeOperation,
    readOperation,
    deleteOperation
}