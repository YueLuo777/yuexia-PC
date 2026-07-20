import { useCallback, useEffect, useState } from 'react';

import {
  DEFAULT_NOVEL_COVER_UPDATED_EVENT,
  getDefaultNovelCover,
  readCustomDefaultNovelCovers,
  readDefaultNovelCoverId,
  removeCustomDefaultNovelCover,
  saveCustomDefaultNovelCover,
  saveDefaultNovelCoverId,
  type DefaultNovelCoverId,
} from '@/features/novels/model/defaultNovelCover';

export function useDefaultNovelCover() {
  const readState = useCallback(() => {
    const selectedCoverId = readDefaultNovelCoverId();
    return {
      selectedCoverId,
      selectedCover: getDefaultNovelCover(selectedCoverId),
      customCovers: readCustomDefaultNovelCovers(),
    };
  }, []);
  const [state, setState] = useState(readState);

  useEffect(() => {
    const refresh = () => setState(readState());
    window.addEventListener(DEFAULT_NOVEL_COVER_UPDATED_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(DEFAULT_NOVEL_COVER_UPDATED_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [readState]);

  const selectDefaultCover = useCallback(
    (id: DefaultNovelCoverId) => {
      saveDefaultNovelCoverId(id);
      setState(readState());
    },
    [readState],
  );

  const uploadCustomCover = useCallback(
    (src: string) => {
      saveCustomDefaultNovelCover(src);
      setState(readState());
    },
    [readState],
  );

  const deleteCustomCover = useCallback(
    (id: Parameters<typeof removeCustomDefaultNovelCover>[0]) => {
      removeCustomDefaultNovelCover(id);
      setState(readState());
    },
    [readState],
  );

  return { ...state, selectDefaultCover, uploadCustomCover, deleteCustomCover };
}
