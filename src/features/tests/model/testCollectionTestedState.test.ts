import { beforeEach, describe, expect, it } from 'vitest';

import { readTestedTestPaths, writeTestedTestPaths } from './testCollectionTestedState';

const validPaths = new Set(['/tomato-genre-iteration-test', '/test-browser']);

describe('test collection tested state migrations', () => {
  beforeEach(() => localStorage.clear());

  it('moves test 19 back to untested once without blocking future completion', () => {
    writeTestedTestPaths(['/tomato-genre-iteration-test', '/test-browser']);

    expect(readTestedTestPaths(validPaths)).toEqual(['/test-browser']);

    writeTestedTestPaths(['/tomato-genre-iteration-test', '/test-browser']);
    expect(readTestedTestPaths(validPaths)).toEqual(['/tomato-genre-iteration-test', '/test-browser']);
  });
});
