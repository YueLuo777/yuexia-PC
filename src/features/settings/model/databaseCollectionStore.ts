export function writeDatabaseCollection<T>(collection: DatabaseCollectionName, items: T[]) {
  if (!window.xinyuexiaDatabase?.writeCollection) return;
  void window.xinyuexiaDatabase.writeCollection(collection, items);
}

export async function hydrateDatabaseCollection<T>(
  collection: DatabaseCollectionName,
  localItems: T[],
  applyItems: (items: T[]) => void,
) {
  if (!window.xinyuexiaDatabase?.readCollection) return;
  const result = await window.xinyuexiaDatabase.readCollection<T>(collection);
  if (!result.ok) return;
  if (result.exists) {
    applyItems(result.data);
    return;
  }
  if (localItems.length > 0) {
    writeDatabaseCollection(collection, localItems);
  }
}
