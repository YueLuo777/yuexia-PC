import { createContext, useContext, type ReactNode } from 'react';

type WorkbenchLibraryVisibility = {
  isActive: boolean;
  activePageKey: string;
};

const WorkbenchLibraryVisibilityContext = createContext<WorkbenchLibraryVisibility>({
  isActive: true,
  activePageKey: '',
});

export function WorkbenchLibraryVisibilityProvider({
  isActive,
  activePageKey,
  children,
}: WorkbenchLibraryVisibility & { children: ReactNode }) {
  return (
    <WorkbenchLibraryVisibilityContext.Provider value={{ isActive, activePageKey }}>
      {children}
    </WorkbenchLibraryVisibilityContext.Provider>
  );
}

export function useWorkbenchLibraryVisibility() {
  return useContext(WorkbenchLibraryVisibilityContext);
}
