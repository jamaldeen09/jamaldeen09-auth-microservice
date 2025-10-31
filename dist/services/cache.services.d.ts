declare const writeOperation: <T>(cacheKey: string, cacheValue: T) => void;
declare const readOperation: (cacheKey: string) => string | undefined;
declare const deleteOperation: (cacheKey: string) => void;
export { writeOperation, readOperation, deleteOperation };
//# sourceMappingURL=cache.services.d.ts.map