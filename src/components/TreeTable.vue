<template>
  <div class="tree-table-container">
    <div class="toolbar">
      <button @click="addNewItem" class="btn btn-primary">
        Добавить элемент
      </button>
      <button @click="expandAll" class="btn btn-info">Развернуть все</button>
      <button @click="collapseAll" class="btn btn-info">Свернуть все</button>
    </div>

    <ag-grid-vue
      ref="agGrid"
      class="ag-theme-alpine"
      :columnDefs="columnDefs"
      :rowData="flattenedItems"
      :defaultColDef="defaultColDef"
      style="height: 600px; width: 100%"
      @cell-value-changed="onCellValueChanged"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import { AgGridVue } from "ag-grid-vue3";
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import type { TreeItem } from "../store/TreeStore";
import { useTreeStore } from "../composables/useTreeStore";

export default defineComponent({
  name: "TreeTable",
  components: {
    AgGridVue,
  },
  props: {
    initialData: {
      type: Array as () => TreeItem[],
      required: true,
    },
  },
  setup(props) {
    const agGrid = ref<InstanceType<typeof AgGridVue>>();

    const {
      flattenedItems,
      getItem,
      getAllChildren,
      hasChildren,
      addItem,
      updateItem,
      removeItem,
      toggleRow,
      expandAll,
      collapseAll,
      isExpanded,
      getNextId,
    } = useTreeStore(props.initialData);

    const nextId = ref<number>(getNextId());

    const columnDefs = [
      {
        field: "index",
        headerName: "№ п/п",
        width: 80,
        valueGetter: (params: any) => {
          if (!params.node || params.node.rowIndex === undefined) return "";
          return params.node.rowIndex + 1;
        },
        sortable: false,
        filter: false,
        cellStyle: { textAlign: "center" },
      },
      {
        field: "label",
        headerName: "Название",
        flex: 2,
        editable: true,
        cellRenderer: (params: any) => {
          if (!params.data) return "";

          const level = params.data.__level || 0;
          const hasChildrenFlag = hasChildren(params.data.id);
          const expanded = isExpanded(params.data.id);

          const div = document.createElement("div");
          div.style.display = "flex";
          div.style.alignItems = "center";
          div.style.paddingLeft = `${level * 20}px`;

          if (hasChildrenFlag) {
            const toggleBtn = document.createElement("button");
            toggleBtn.textContent = expanded ? "▼" : "▶";
            toggleBtn.style.marginRight = "8px";
            toggleBtn.style.cursor = "pointer";
            toggleBtn.style.background = "none";
            toggleBtn.style.border = "none";
            toggleBtn.style.fontSize = "12px";
            toggleBtn.style.width = "20px";
            toggleBtn.onclick = (e) => {
              e.stopPropagation();
              toggleRow(params.data.id);
              refreshGrid();
            };
            div.appendChild(toggleBtn);
          } else {
            const spacer = document.createElement("span");
            spacer.style.width = "28px";
            spacer.style.display = "inline-block";
            div.appendChild(spacer);
          }

          const label = document.createElement("span");
          label.textContent = params.value;
          div.appendChild(label);

          return div;
        },
      },
      {
        field: "category",
        headerName: "Категория",
        width: 120,
        valueGetter: (params: any) => {
          if (!params.data) return "";
          return hasChildren(params.data.id) ? "Группа" : "Элемент";
        },
        cellStyle: (params: any) => {
          if (!params.data) return {};
          return {
            fontWeight: hasChildren(params.data.id) ? "bold" : "normal",
            color: hasChildren(params.data.id) ? "#007bff" : "#666",
          };
        },
      },
      {
        field: "id",
        headerName: "ID",
        width: 150,
        cellStyle: { fontFamily: "monospace" },
        valueFormatter: (params: any) => {
          if (params.value === undefined || params.value === null) return "-";
          return String(params.value);
        },
      },
      {
        field: "parent",
        headerName: "Родитель",
        width: 150,
        editable: true,
        valueFormatter: (params: any) => {
          if (params.value === null || params.value === undefined) return "-";
          const parentItem = getItem(params.value);
          return parentItem ? parentItem.label : String(params.value);
        },
        valueSetter: (params: any) => {
          let parentValue = params.newValue;
          if (parentValue === "-" || parentValue === "") {
            parentValue = null;
          } else {
            const allItems = flattenedItems.value;
            const parentItem = allItems.find(
              (item) => item.label === parentValue,
            );
            if (parentItem) {
              parentValue = parentItem.id;
            }
          }

          const updatedItem = { ...params.data, parent: parentValue };
          updateItem(updatedItem);
          return true;
        },
      },
      {
        headerName: "Действия",
        width: 120,
        cellRenderer: (params: any) => {
          const div = document.createElement("div");
          div.style.display = "flex";
          div.style.gap = "8px";

          const deleteBtn = document.createElement("button");
          deleteBtn.textContent = "Удалить";
          deleteBtn.style.background = "#dc3545";
          deleteBtn.style.color = "white";
          deleteBtn.style.border = "none";
          deleteBtn.style.padding = "4px 8px";
          deleteBtn.style.borderRadius = "4px";
          deleteBtn.style.cursor = "pointer";
          deleteBtn.style.fontSize = "12px";

          deleteBtn.onclick = () => {
            const item = getItem(params.data.id);
            if (!item) return;

            const childrenCount = getAllChildren(params.data.id).length;
            const message =
              childrenCount > 0
                ? `Удалить элемент "${item.label}" и всех его потомков (${childrenCount} элементов)?`
                : `Удалить элемент "${item.label}"?`;

            if (confirm(message)) {
              removeItem(params.data.id);
              refreshGrid();
            }
          };

          div.appendChild(deleteBtn);
          return div;
        },
      },
    ];

    const defaultColDef = {
      sortable: true,
      filter: true,
      resizable: true,
    };

    const addNewItem = () => {
      const newId = nextId.value++;
      const newItem: TreeItem = {
        id: newId,
        parent: null,
        label: `Новый элемент ${newId}`,
      };

      try {
        addItem(newItem);
        nextId.value = getNextId();
        refreshGrid();

        setTimeout(() => {
          if (agGrid.value?.api) {
            let newNode: any = null;
            agGrid.value.api.forEachNode((node: any) => {
              if (node.data?.id === newId) {
                newNode = node;
              }
            });
            if (newNode) {
              agGrid.value.api.ensureNodeVisible(newNode);
            }
          }
        }, 100);
      } catch (error) {
        console.error("Error adding item:", error);
        alert(
          error instanceof Error
            ? error.message
            : "Ошибка при добавлении элемента",
        );
      }
    };

    const onCellValueChanged = (event: any) => {
      const { data, colDef, newValue, oldValue } = event;

      if (newValue === oldValue) return;

      const updatedItem = { ...data };

      if (colDef.field === "label") {
        updatedItem.label = newValue;
        updateItem(updatedItem);
        refreshGrid();
      }
    };

    const refreshGrid = () => {
      if (agGrid.value?.api) {
        setTimeout(() => {
          agGrid.value?.api?.refreshCells();
        }, 0);
      }
    };

    onMounted(() => {
      setTimeout(() => {
        refreshGrid();
      }, 100);
    });

    return {
      agGrid,
      columnDefs,
      flattenedItems,
      defaultColDef,
      addNewItem,
      onCellValueChanged,
      expandAll,
      collapseAll,
    };
  },
});
</script>

<style scoped>
.tree-table-container {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.toolbar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  font-weight: 500;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
  transform: translateY(-1px);
}

.btn-info {
  background: #17a2b8;
  color: white;
}

.btn-info:hover {
  background: #138496;
  transform: translateY(-1px);
}

:deep(.ag-row) {
  cursor: default;
}

:deep(.ag-row-editing) {
  background-color: #fff3cd;
}

:deep(.ag-cell) {
  display: flex;
  align-items: center;
}

:deep(.ag-row-hover) {
  background-color: #f8f9fa;
}

:deep(.ag-header-cell-label) {
  font-weight: 600;
  color: #495057;
}

button {
  background: none;
  border: none;
  cursor: pointer;
}

button:hover {
  opacity: 0.8;
}
</style>
