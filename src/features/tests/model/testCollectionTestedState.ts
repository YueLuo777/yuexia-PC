const TEST_COLLECTION_TESTED_PATHS_KEY = 'xinyuexia_test_collection_tested_paths_v1';

export function readTestedTestPaths(validPaths: ReadonlySet<string>) {
  try {
    const parsed = JSON.parse(localStorage.getItem(TEST_COLLECTION_TESTED_PATHS_KEY) ?? '[]') as unknown;
    if (!Array.isArray(parsed)) return [];
    const paths = parsed.filter((item): item is string => typeof item === 'string' && validPaths.has(item));
    if (paths.length !== parsed.length) writeTestedTestPaths(paths);
    return paths;
  } catch {
    return [];
  }
}

export function writeTestedTestPaths(paths: Iterable<string>) {
  localStorage.setItem(TEST_COLLECTION_TESTED_PATHS_KEY, JSON.stringify(Array.from(paths)));
}
