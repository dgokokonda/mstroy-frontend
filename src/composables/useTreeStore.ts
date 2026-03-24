import { ref, computed, type Ref, type ComputedRef } from "vue";
import { TreeStore, type TreeItem } from "../store/TreeStore";

export interface UseTreeStoreReturn {
  items: ComputedRef<TreeItem[]>;
  flattenedItems: ComputedRef<(TreeItem & { __level?: number })[]>;
  expandedRows: Ref<Set<string | number>>;
  getItem: (id: string | number) => TreeItem | undefined;
  getChildren: (id: string | number) => TreeItem[];
  getAllChildren: (id: string | number) => TreeItem[];
  getAllParents: (id: string | number) => TreeItem[];
  hasChildren: (id: string | number) => boolean;
  addItem: (item: TreeItem) => void;
  updateItem: (item: TreeItem) => void;
  removeItem: (id: string | number) => void;
  toggleRow: (id: string | number) => void;
  expandRow: (id: string | number) => void;
  collapseRow: (id: string | number) => void;
  expandAll: () => void;
  collapseAll: () => void;
  isExpanded: (id: string | number) => boolean;
  getRowLevel: (id: string | number) => number;
  getNextId: () => number;
}

export function useTreeStore(initialData: TreeItem[]): UseTreeStoreReturn {
  const store = ref<TreeStore>(new TreeStore(initialData));
  const expandedRows = ref<Set<string | number>>(new Set());

  const getMaxId = (): number => {
    const items = store.value.getAll();
    const maxId = Math.max(
      ...items
        .map((i) => (typeof i.id === "number" ? i.id : 0))
        .filter((id) => id > 0),
      0,
    );
    return maxId + 1;
  };

  const getNextId = (): number => {
    return getMaxId();
  };

  const initExpandedRows = () => {
    const rootItems = store.value
      .getAll()
      .filter((item) => item.parent === null || item.parent === undefined);
    rootItems.forEach((item) => {
      if (store.value.hasChildren(item.id)) {
        expandedRows.value.add(item.id);
      }
    });
  };

  initExpandedRows();

  const getRowLevel = (id: string | number): number => {
    let level = 0;
    let currentId: string | number | null = id;
    let currentItem = store.value.getItem(currentId);

    while (
      currentItem &&
      currentItem.parent !== null &&
      currentItem.parent !== undefined
    ) {
      level++;
      currentId = currentItem.parent;
      currentItem = store.value.getItem(currentId);
    }

    return level;
  };

  const getFlattenedData = (): (TreeItem & { __level?: number })[] => {
    const result: (TreeItem & { __level?: number })[] = [];

    const addWithChildren = (item: TreeItem, level: number = 0) => {
      result.push({ ...item, __level: level });
      const children = store.value.getChildren(item.id);
      const isExpanded = expandedRows.value.has(item.id);

      if (isExpanded && children.length > 0) {
        children.forEach((child) => addWithChildren(child, level + 1));
      }
    };

    const rootItems = store.value
      .getAll()
      .filter((item) => item.parent === null || item.parent === undefined);
    rootItems.forEach((item) => addWithChildren(item));

    return result;
  };

  const items = computed(() => store.value.getAll());
  const flattenedItems = computed(() => getFlattenedData());

  const getItem = (id: string | number) => store.value.getItem(id);
  const getChildren = (id: string | number) => store.value.getChildren(id);
  const getAllChildren = (id: string | number) =>
    store.value.getAllChildren(id);
  const getAllParents = (id: string | number) => store.value.getAllParents(id);
  const hasChildren = (id: string | number) => store.value.hasChildren(id);

  const addItem = (item: TreeItem) => {
    store.value.addItem(item);
  };

  const updateItem = (item: TreeItem) => {
    store.value.updateItem(item);
  };

  const removeItem = (id: string | number) => {
    const allChildren = store.value.getAllChildren(id);
    expandedRows.value.delete(id);
    allChildren.forEach((child) => expandedRows.value.delete(child.id));
    store.value.removeItem(id);
  };

  const toggleRow = (id: string | number) => {
    if (expandedRows.value.has(id)) {
      expandedRows.value.delete(id);
    } else {
      expandedRows.value.add(id);
    }
  };

  const expandRow = (id: string | number) => {
    expandedRows.value.add(id);
  };

  const collapseRow = (id: string | number) => {
    expandedRows.value.delete(id);
  };

  const isExpanded = (id: string | number) => {
    return expandedRows.value.has(id);
  };

  const expandAll = () => {
    const allItems = store.value.getAll();
    allItems.forEach((item) => {
      if (store.value.hasChildren(item.id)) {
        expandedRows.value.add(item.id);
      }
    });
  };

  const collapseAll = () => {
    expandedRows.value.clear();
  };

  return {
    items,
    flattenedItems,
    expandedRows,
    getItem,
    getChildren,
    getAllChildren,
    getAllParents,
    hasChildren,
    addItem,
    updateItem,
    removeItem,
    toggleRow,
    expandRow,
    collapseRow,
    expandAll,
    collapseAll,
    isExpanded,
    getRowLevel,
    getNextId,
  };
}
