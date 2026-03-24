import { describe, it, expect, beforeEach } from "vitest";
import { TreeStore, type TreeItem } from "../src/store/TreeStore";

const testData: TreeItem[] = [
  { id: 1, parent: null, label: "Айтем 1" },
  { id: "91064cee", parent: 1, label: "Айтем 2" },
  { id: 3, parent: 1, label: "Айтем 3" },
  { id: 4, parent: "91064cee", label: "Айтем 4" },
  { id: 5, parent: "91064cee", label: "Айтем 5" },
  { id: 6, parent: "91064cee", label: "Айтем 6" },
  { id: 7, parent: 4, label: "Айтем 7" },
  { id: 8, parent: 4, label: "Айтем 8" },
];

describe("TreeStore", () => {
  let store: TreeStore;

  beforeEach(() => {
    store = new TreeStore(testData);
  });

  describe("getAll", () => {
    it("should return all items", () => {
      const items = store.getAll();
      expect(items).toHaveLength(8);
      expect(items).toEqual(testData);
    });
  });

  describe("getItem", () => {
    it("should return item by id", () => {
      const item = store.getItem(1);
      expect(item).toEqual(testData[0]);
    });

    it("should return undefined for non-existent id", () => {
      const item = store.getItem(999);
      expect(item).toBeUndefined();
    });

    it("should work with string ids", () => {
      const item = store.getItem("91064cee");
      expect(item).toEqual(testData[1]);
    });
  });

  describe("getChildren", () => {
    it("should return direct children", () => {
      const children = store.getChildren(1);
      expect(children).toHaveLength(2);
      expect(children.map((c) => c.id)).toContain("91064cee");
      expect(children.map((c) => c.id)).toContain(3);
    });

    it("should return empty array for leaf node", () => {
      const children = store.getChildren(7);
      expect(children).toHaveLength(0);
    });
  });

  describe("getAllChildren", () => {
    it("should return all descendants", () => {
      const children1 = store.getAllChildren(1);
      const children2 = store.getAllChildren("91064cee");
      const children3 = store.getAllChildren(4);
      expect(children1).toHaveLength(7);
      expect(children2).toHaveLength(5);
      expect(children3).toHaveLength(2);
    });

    it("should return empty array for leaf node", () => {
      const children = store.getAllChildren(7);
      expect(children).toHaveLength(0);
    });
  });

  describe("getAllParents", () => {
    it("should return path to root", () => {
      const parents1 = store.getAllParents(7);
      expect(parents1).toHaveLength(4);
      expect(parents1[0].id).toBe(7);
      expect(parents1[1].id).toBe(4);
      expect(parents1[2].id).toBe("91064cee");
      expect(parents1[3].id).toBe(1);

      const parents2 = store.getAllParents(6);
      expect(parents2).toHaveLength(3);
      expect(parents2[0].id).toBe(6);
      expect(parents2[1].id).toBe("91064cee");
      expect(parents2[2].id).toBe(1);
    });

    it("should return single element for root item", () => {
      const parents = store.getAllParents(1);
      expect(parents).toHaveLength(1);
      expect(parents[0].id).toBe(1);
    });

    it("should return empty array for non-existent id", () => {
      const parents = store.getAllParents(999);
      expect(parents).toHaveLength(0);
    });
  });

  describe("addItem", () => {
    it("should add new item", () => {
      const newItem: TreeItem = { id: 9, parent: 1, label: "Новый айтем" };
      store.addItem(newItem);

      expect(store.getItem(9)).toEqual(newItem);
      expect(store.getChildren(1)).toHaveLength(3);
    });

    it("should throw error when adding duplicate id", () => {
      const duplicateItem: TreeItem = {
        id: 1,
        parent: null,
        label: "Дубликат",
      };
      expect(() => store.addItem(duplicateItem)).toThrow(
        "Item with id 1 already exists",
      );
    });
  });

  describe("removeItem", () => {
    it("should remove item and its children", () => {
      store.removeItem("91064cee");

      expect(store.getItem("91064cee")).toBeUndefined();
      expect(store.getItem(4)).toBeUndefined();
      expect(store.getItem(5)).toBeUndefined();
      expect(store.getItem(6)).toBeUndefined();
      expect(store.getItem(7)).toBeUndefined();
      expect(store.getItem(8)).toBeUndefined();
      expect(store.getItem(1)).toBeDefined();
      expect(store.getItem(3)).toBeDefined();
    });
  });

  describe("updateItem", () => {
    it("should update item properties", () => {
      const updatedItem = { ...testData[0], label: "Обновленный айтем" };
      store.updateItem(updatedItem);

      expect(store.getItem(1)?.label).toBe("Обновленный айтем");
    });

    it("should update parent relationships", () => {
      const updatedItem = { ...testData[4], parent: 3 };
      store.updateItem(updatedItem);

      const oldParentChildren = store.getChildren("91064cee");
      const newParentChildren = store.getChildren(3);

      const foundInOld = oldParentChildren.some((c) => c.id === 5);
      const foundInNew = newParentChildren.some((c) => c.id === 5);

      expect(foundInOld).toBe(false);
      expect(foundInNew).toBe(true);
    });
  });

  describe("performance", () => {
    it("should handle large datasets efficiently", () => {
      const largeData: TreeItem[] = [];
      for (let i = 1; i <= 10000; i++) {
        largeData.push({
          id: i,
          parent: i > 1 ? i - 1 : null,
          label: `Item ${i}`,
        });
      }

      const start = performance.now();
      const largeStore = new TreeStore(largeData);
      const buildTime = performance.now() - start;

      expect(buildTime).toBeLessThan(100);

      const getStart = performance.now();
      const children = largeStore.getAllChildren(1);
      const getTime = performance.now() - getStart;

      expect(children).toHaveLength(9999);
      expect(getTime).toBeLessThan(50);
    });
  });

  describe("TreeStore - edge cases", () => {
    let store: TreeStore;

    beforeEach(() => {
      store = new TreeStore(testData);
    });

    it("should handle removeItem with non-existent id", () => {
      expect(() => store.removeItem(999)).not.toThrow();
      expect(store.getAll()).toHaveLength(8);
    });

    it("should handle updateItem with parent as null", () => {
      const updatedItem = { ...testData[4], parent: null };
      store.updateItem(updatedItem);

      const item = store.getItem(5);
      expect(item?.parent).toBeNull();
    });

    it("should handle addItem with parent that has existing children", () => {
      const newItem = { id: 9, parent: 1, label: "Новый элемент" };
      store.addItem(newItem);

      expect(store.getChildren(1)).toHaveLength(3);
    });

    it("should handle getAllChildren with no children", () => {
      const children = store.getAllChildren(999);
      expect(children).toHaveLength(0);
    });

    it("should handle getAllParents caching", () => {
      const firstCall = store.getAllParents(7);
      const secondCall = store.getAllParents(7);

      expect(firstCall).toEqual(secondCall);
      expect(firstCall).toHaveLength(4);
    });

    it("should handle updateItem when parent changes to existing parent", () => {
      const updatedItem = { ...testData[7], parent: 1 };
      store.updateItem(updatedItem);

      expect(store.getChildren(1)).toHaveLength(3);
      expect(store.getChildren(4)).toHaveLength(1);
    });

    it("should handle updateItem when parent changes to null", () => {
      const updatedItem = { ...testData[1], parent: null };
      store.updateItem(updatedItem);

      const rootItems = store.getAll().filter((item) => item.parent === null);
      expect(rootItems).toHaveLength(2);
    });

    it("should handle removeItem with children and update cache", () => {
      store.removeItem(1);

      expect(store.getAll()).toHaveLength(0);
      expect(store.getAllParents(1)).toHaveLength(0);
    });
  });
});
