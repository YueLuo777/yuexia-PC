import { useEffect, useRef } from 'react';

export function getWorkbenchSettingTreeEndSpacerHeight(
  navigationHeight: number,
  domainHeaderHeight: number,
  groupHeaderHeight: number,
  settingRowHeight: number,
) {
  return Math.max(0, navigationHeight - domainHeaderHeight - groupHeaderHeight - settingRowHeight);
}

export function getWorkbenchSettingTreeSelectedPathHeight(selectedIndex: number) {
  return 22 + selectedIndex * 37;
}

export function useWorkbenchSettingTreeStickyNavigation(enabled: boolean, resetToTop: boolean) {
  const navigationRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (resetToTop && navigationRef.current) navigationRef.current.scrollTop = 0;
  }, [resetToTop]);

  useEffect(() => {
    const navigation = navigationRef.current;
    if (!navigation || !enabled) return;
    const updateHeight = () => {
      const domainHeader = navigation.querySelector<HTMLElement>('[data-sticky-level="1"]');
      const groupHeader = navigation.querySelector<HTMLElement>('[data-sticky-level="2"]');
      const settingRow = navigation.querySelector<HTMLElement>('[data-setting-tree-entry="true"]');
      if (!domainHeader || !groupHeader || !settingRow) return;
      const height = getWorkbenchSettingTreeEndSpacerHeight(
        navigation.clientHeight,
        domainHeader.offsetHeight,
        groupHeader.offsetHeight,
        settingRow.offsetHeight,
      );
      navigation.style.setProperty('--workbench-setting-tree-end-spacer-height', `${height}px`);
    };

    updateHeight();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(updateHeight);
    observer.observe(navigation);
    return () => observer.disconnect();
  }, [enabled]);

  return navigationRef;
}
