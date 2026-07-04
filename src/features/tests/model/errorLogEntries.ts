export type { ErrorLogEntry } from './errorLogEntryTypes';

export async function loadDefaultErrorLogEntries() {
  const module = await import('./errorLogDefaultEntries.generated');
  return module.defaultEntries;
}
