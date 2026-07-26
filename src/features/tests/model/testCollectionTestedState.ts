const TEST_COLLECTION_TESTED_PATHS_KEY = 'xinyuexia_test_collection_tested_paths_v1';
const TEST_COLLECTION_REOPENED_PATHS_KEY = 'xinyuexia_test_collection_reopened_paths_v1';
const REOPENED_TEST_PATHS = new Set(['/tomato-genre-iteration-test']);

function reopenRequestedTestsOnce(paths: string[]) {
  if (localStorage.getItem(TEST_COLLECTION_REOPENED_PATHS_KEY) === '1') return paths;
  localStorage.setItem(TEST_COLLECTION_REOPENED_PATHS_KEY, '1');
  return paths.filter((path) => !REOPENED_TEST_PATHS.has(path));
}

export function readTestedTestPaths(validPaths: ReadonlySet<string>) {
  try {
    const parsed = JSON.parse(localStorage.getItem(TEST_COLLECTION_TESTED_PATHS_KEY) ?? '[]') as unknown;
    if (!Array.isArray(parsed)) return [];
    const validStoredPaths = parsed.filter((item): item is string => typeof item === 'string' && validPaths.has(item));
    const paths = reopenRequestedTestsOnce(validStoredPaths);
    if (paths.length !== parsed.length) writeTestedTestPaths(paths);
    return paths;
  } catch {
    return [];
  }
}

export function writeTestedTestPaths(paths: Iterable<string>) {
  localStorage.setItem(TEST_COLLECTION_TESTED_PATHS_KEY, JSON.stringify(Array.from(paths)));
}
