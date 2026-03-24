export interface TreeItem {
  id: string | number;
  parent: string | number | null;
  label: string;
  [key: string]: any;
}

export class TreeStore {
  private items: Map<string | number, TreeItem>;
  private childrenMap: Map<string | number, TreeItem[]>;

  constructor(items: TreeItem[]) {
    this.items = new Map();
    this.childrenMap = new Map();
    this.buildMaps(items);
  }

  private buildMaps(items: TreeItem[]): void {
    items.forEach((item) => {
      this.items.set(item.id, { ...item });
    });

    // O(1) алгоритм
    this.childrenMap.clear();
    this.items.forEach((item) => {
      const parentId = item.parent;
      if (parentId !== null && parentId !== undefined) {
        if (!this.childrenMap.has(parentId)) {
          this.childrenMap.set(parentId, []);
        }
        this.childrenMap.get(parentId)!.push(item);
      }
    });
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
    const queue = [...this.getChildren(id)];

    while (queue.length > 0) {
      const item = queue.shift()!;
      result.push(item);
      queue.push(...this.getChildren(item.id));
    }

    return result;
  }

  getAllParents(id: string | number): TreeItem[] {
    const result: TreeItem[] = [];
    let currentId: string | number | null = id;
    let currentItem = this.getItem(currentId);

    while (currentItem) {
      result.push(currentItem);
      currentId = currentItem.parent;
      if (currentId === null || currentId === undefined) break;
      currentItem = this.getItem(currentId);
    }

    return result;
  }

  addItem(item: TreeItem): void {
    if (this.items.has(item.id)) {
      throw new Error(`Item with id ${item.id} already exists`);
    }

    this.items.set(item.id, { ...item });

    if (item.parent !== null && item.parent !== undefined) {
      if (!this.childrenMap.has(item.parent)) {
        this.childrenMap.set(item.parent, []);
      }
      this.childrenMap.get(item.parent)!.push(this.items.get(item.id)!);
    }
  }

  removeItem(id: string | number): void {
    const item = this.getItem(id);
    if (!item) return;

    const childrenToRemove = this.getAllChildren(id);
    childrenToRemove.forEach((child) => {
      this.items.delete(child.id);
    });

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
  }

  updateItem(updatedItem: TreeItem): void {
    const existingItem = this.getItem(updatedItem.id);
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
        if (!this.childrenMap.has(newParent)) {
          this.childrenMap.set(newParent, []);
        }
        this.childrenMap.get(newParent)!.push(this.items.get(updatedItem.id)!);
      }
    }
  }

  hasChildren(id: string | number): boolean {
    const children = this.childrenMap.get(id);
    return children !== undefined && children.length > 0;
  }
}
