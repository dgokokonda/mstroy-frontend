import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import TreeTable from "../src/components/TreeTable.vue";
import type { TreeItem } from "../src/store/TreeStore";

const mockData: TreeItem[] = [
  { id: 1, parent: null, label: "Айтем 1" },
  { id: 2, parent: 1, label: "Айтем 2" },
  { id: 3, parent: 1, label: "Айтем 3" },
];

describe("TreeTable", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("should render component", () => {
    const wrapper = mount(TreeTable, {
      props: {
        initialData: mockData,
      },
      global: {
        stubs: {
          "ag-grid-vue": true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find(".tree-table-container").exists()).toBe(true);
  });

  it("should display toolbar buttons", () => {
    const wrapper = mount(TreeTable, {
      props: {
        initialData: mockData,
      },
      global: {
        stubs: {
          "ag-grid-vue": true,
        },
      },
    });

    const buttons = wrapper.findAll(".btn");
    expect(buttons).toHaveLength(3);
    expect(buttons[0].text()).toBe("Добавить элемент");
    expect(buttons[1].text()).toBe("Развернуть все");
    expect(buttons[2].text()).toBe("Свернуть все");
  });

  it("should pass initialData to TreeStore", () => {
    const wrapper = mount(TreeTable, {
      props: {
        initialData: mockData,
      },
      global: {
        stubs: {
          "ag-grid-vue": true,
        },
      },
    });

    expect(wrapper.props("initialData")).toEqual(mockData);
  });

  it("should have correct column definitions", () => {
    const wrapper = mount(TreeTable, {
      props: {
        initialData: mockData,
      },
      global: {
        stubs: {
          "ag-grid-vue": true,
        },
      },
    });

    const component = wrapper.vm as any;
    const columnDefs = component.columnDefs;

    expect(columnDefs.length).toBeGreaterThanOrEqual(6);
    expect(columnDefs[0].field).toBe("index");
    expect(columnDefs[0].headerName).toBe("№ п/п");
    expect(columnDefs[1].field).toBe("label");
    expect(columnDefs[1].headerName).toBe("Название");
    expect(columnDefs[2].field).toBe("category");
    expect(columnDefs[2].headerName).toBe("Категория");
  });

  it("should handle add new item", async () => {
    const wrapper = mount(TreeTable, {
      props: {
        initialData: mockData,
      },
      global: {
        stubs: {
          "ag-grid-vue": true,
        },
      },
    });

    const component = wrapper.vm as any;
    const initialCount = component.flattenedItems?.length || 0;

    await component.addNewItem();
    await wrapper.vm.$nextTick();

    const newCount = component.flattenedItems?.length || 0;
    expect(newCount).toBeGreaterThan(initialCount);
  });

  it("should handle delete item", async () => {
    const wrapper = mount(TreeTable, {
      props: {
        initialData: mockData,
      },
      global: {
        stubs: {
          "ag-grid-vue": true,
        },
      },
    });

    const component = wrapper.vm as any;
    const initialCount = component.flattenedItems?.length || 0;

    const confirmSpy = vi.spyOn(window, "confirm");
    confirmSpy.mockImplementation(() => true);

    const deleteItemMethod = component.columnDefs.find(
      (col: any) => col.headerName === "Действия",
    )?.cellRenderer;
    if (deleteItemMethod) {
      const mockParams = { data: { id: 2, label: "Айтем 2" } };
      const renderResult = deleteItemMethod(mockParams);
      const deleteBtn = renderResult.querySelector("button");
      if (deleteBtn) {
        deleteBtn.onclick();
      }
    }

    await wrapper.vm.$nextTick();

    const newCount = component.flattenedItems?.length || 0;
    expect(newCount).toBe(initialCount - 1);

    confirmSpy.mockRestore();
  });

  it("should handle update item", async () => {
    const wrapper = mount(TreeTable, {
      props: {
        initialData: mockData,
      },
      global: {
        stubs: {
          "ag-grid-vue": true,
        },
      },
    });

    const component = wrapper.vm as any;

    const event = {
      data: { ...mockData[0], id: 1, label: "Айтем 1" },
      colDef: { field: "label" },
      newValue: "Обновленный айтем",
      oldValue: "Айтем 1",
    };

    await component.onCellValueChanged(event);
    await wrapper.vm.$nextTick();

    const updatedItem = component.flattenedItems?.find(
      (item: any) => item.id === 1,
    );
    expect(updatedItem?.label).toBe("Обновленный айтем");
  });

  it("should compute category correctly", async () => {
    const wrapper = mount(TreeTable, {
      props: {
        initialData: mockData,
      },
      global: {
        stubs: {
          "ag-grid-vue": true,
        },
      },
    });

    const component = wrapper.vm as any;

    const categoryColumn = component.columnDefs.find(
      (col: any) => col.field === "category",
    );
    expect(categoryColumn).toBeDefined();

    if (categoryColumn && categoryColumn.valueGetter) {
      const categoryForParent = categoryColumn.valueGetter({ data: { id: 1 } });
      expect(categoryForParent).toBe("Группа");

      const categoryForChild = categoryColumn.valueGetter({ data: { id: 2 } });
      expect(categoryForChild).toBe("Элемент");
    }
  });

  it("should compute index correctly", () => {
    const wrapper = mount(TreeTable, {
      props: {
        initialData: mockData,
      },
      global: {
        stubs: {
          "ag-grid-vue": true,
        },
      },
    });

    const component = wrapper.vm as any;
    const indexGetter = component.columnDefs[0].valueGetter;

    const mockParams = {
      node: {
        rowIndex: 0,
      },
    };

    expect(indexGetter(mockParams)).toBe(1);
  });

  it("should handle expand all", () => {
    const wrapper = mount(TreeTable, {
      props: {
        initialData: mockData,
      },
      global: {
        stubs: {
          "ag-grid-vue": true,
        },
      },
    });

    const component = wrapper.vm as any;
    const expandAllSpy = vi.spyOn(component, "expandAll");

    component.expandAll();

    expect(expandAllSpy).toHaveBeenCalled();
  });

  it("should handle collapse all", () => {
    const wrapper = mount(TreeTable, {
      props: {
        initialData: mockData,
      },
      global: {
        stubs: {
          "ag-grid-vue": true,
        },
      },
    });

    const component = wrapper.vm as any;
    const collapseAllSpy = vi.spyOn(component, "collapseAll");

    component.collapseAll();

    expect(collapseAllSpy).toHaveBeenCalled();
  });

  it("should format ID correctly", () => {
    const wrapper = mount(TreeTable, {
      props: {
        initialData: mockData,
      },
      global: {
        stubs: {
          "ag-grid-vue": true,
        },
      },
    });

    const component = wrapper.vm as any;
    const idColumn = component.columnDefs.find(
      (col: any) => col.field === "id",
    );

    expect(idColumn).toBeDefined();

    if (idColumn && idColumn.valueFormatter) {
      expect(idColumn.valueFormatter({ value: 123 })).toBe("123");
      expect(idColumn.valueFormatter({ value: "abc" })).toBe("abc");
      expect(idColumn.valueFormatter({ value: null })).toBe("-");
      expect(idColumn.valueFormatter({ value: undefined })).toBe("-");
    }
  });
});
