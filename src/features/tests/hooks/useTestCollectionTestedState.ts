import { useEffect, useState } from 'react';

import { readTestedTestPaths, writeTestedTestPaths } from '@/features/tests/model/testCollectionTestedState';

export function useTestCollectionTestedState(validTestPaths: Set<string>) {
  const [testedTestPaths, setTestedTestPaths] = useState<Set<string>>(
    () => new Set(readTestedTestPaths(validTestPaths)),
  );

  useEffect(() => {
    setTestedTestPaths((current) => {
      const next = new Set(Array.from(current).filter((path) => validTestPaths.has(path)));
      if (next.size === current.size) return current;
      writeTestedTestPaths(next);
      return next;
    });
  }, [validTestPaths]);

  const toggleTestedTest = (path: string) => {
    const willBeTested = !testedTestPaths.has(path);
    setTestedTestPaths((current) => {
      const next = new Set(current);
      if (willBeTested) next.add(path);
      else next.delete(path);
      writeTestedTestPaths(next);
      return next;
    });
  };

  return { testedTestPaths, toggleTestedTest };
}
