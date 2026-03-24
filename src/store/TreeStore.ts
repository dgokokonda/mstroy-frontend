export interface TreeItem {
  id: string | number;
  parent: string | number | null;
  label: string;
  [key: string]: any;
}

export class TreeStore {
  private items: Map<string | number, TreeItem>;
  private childrenMap: Map<string | number, TreeItem[]>;
  private parentsCache: Map<string | number, TreeItem[]>;

  constructor(items: TreeItem[]) {
    this.items = new Map(); // O(1) доступ по id
    this.childrenMap = new Map(); // O(1) получение детей
    this.parentsCache = new Map(); // Кэш для getAllParents
    this.buildMaps(items);
  }

  private buildMaps(items: TreeItem[]): void {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      this.items.set(item.id, { ...item });
    }

    for (const [_, item] of this.items) {
      const parentId = item.parent;
      if (parentId !== null && parentId !== undefined) {
        const children = this.childrenMap.get(parentId);
        if (children) {
          children.push(item);
        } else {
          this.childrenMap.set(parentId, [item]);
        }
      }
    }
  }

  getAll(): TreeItem[] {
    return Array.from(this.items.values());
  }

  getItem(id: string | number): TreeItem | undefined {
    return this.items.get(id);
  }

  getChildren(id: string | number): TreeItem[] {
    return this.childrenMap.get(id) || [];
  }

  getAllChildren(id: string | number): TreeItem[] {
    const result: TreeItem[] = [];
    const stack = this.childrenMap.get(id);
    if (!stack) return result;

    for (let i = 0; i < stack.length; i++) {
      const item = stack[i];
      result.push(item);
      const grandchildren = this.childrenMap.get(item.id);
      if (grandchildren) {
        stack.push(...grandchildren);
      }
    }

    return result;
  }

  getAllParents(id: string | number): TreeItem[] {
    if (this.parentsCache.has(id)) {
      return [...this.parentsCache.get(id)!];
    }

    const result: TreeItem[] = [];
    let currentId: string | number | null = id;
    let currentItem = this.items.get(currentId);

    while (currentItem) {
      result.push(currentItem);
      currentId = currentItem.parent;
      if (currentId === null || currentId === undefined) break;
      currentItem = this.items.get(currentId);
    }

    this.parentsCache.set(id, result);
    return [...result];
  }

  addItem(item: TreeItem): void {
    if (this.items.has(item.id)) {
      throw new Error(`Item with id ${item.id} already exists`);
    }

    this.items.set(item.id, { ...item });

    if (item.parent !== null && item.parent !== undefined) {
      const children = this.childrenMap.get(item.parent);
      if (children) {
        children.push(this.items.get(item.id)!);
      } else {
        this.childrenMap.set(item.parent, [this.items.get(item.id)!]);
      }
    }

    this.parentsCache.clear();
  }

  removeItem(id: string | number): void {
    const item = this.items.get(id);
    if (!item) return;

    const childrenToRemove = this.getAllChildren(id);
    for (let i = 0; i < childrenToRemove.length; i++) {
      this.items.delete(childrenToRemove[i].id);
      this.childrenMap.delete(childrenToRemove[i].id);
    }

    this.items.delete(id);
    this.childrenMap.delete(id);

    if (item.parent !== null && item.parent !== undefined) {
      const parentChildren = this.childrenMap.get(item.parent);
      if (parentChildren) {
        const index = parentChildren.findIndex((child) => child.id === id);
        if (index !== -1) {
          parentChildren.splice(index, 1);
        }
      }
    }

    this.parentsCache.clear();
  }

  updateItem(updatedItem: TreeItem): void {
    const existingItem = this.items.get(updatedItem.id);
    if (!existingItem) {
      throw new Error(`Item with id ${updatedItem.id} not found`);
    }

    const oldParent = existingItem.parent;
    const newParent = updatedItem.parent;

    this.items.set(updatedItem.id, { ...updatedItem });

    if (oldParent !== newParent) {
      if (oldParent !== null && oldParent !== undefined) {
        const oldParentChildren = this.childrenMap.get(oldParent);
        if (oldParentChildren) {
          const index = oldParentChildren.findIndex(
            (child) => child.id === updatedItem.id,
          );
          if (index !== -1) {
            oldParentChildren.splice(index, 1);
          }
        }
      }

      if (newParent !== null && newParent !== undefined) {
        const newParentChildren = this.childrenMap.get(newParent);
        if (newParentChildren) {
          newParentChildren.push(this.items.get(updatedItem.id)!);
        } else {
          this.childrenMap.set(newParent, [this.items.get(updatedItem.id)!]);
        }
      }

      this.parentsCache.clear();
    }
  }

  hasChildren(id: string | number): boolean {
    const children = this.childrenMap.get(id);
    return children !== undefined && children.length > 0;
  }
}
