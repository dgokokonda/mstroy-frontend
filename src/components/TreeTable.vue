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
import { labelRenderer } from "./renderers/labelRenderer";
import { actionsRenderer } from "./renderers/actionsRenderer";

export default defineComponent({
  name: "TreeTable",
  components: { AgGridVue },
  props: {
    initialData: { type: Array as () => TreeItem[], required: true },
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
        sortable: false,
        filter: false,
        cellStyle: { textAlign: "center" },
        valueGetter: (params: any) =>
          params.node?.rowIndex !== undefined ? params.node.rowIndex + 1 : "",
      },
      {
        field: "label",
        headerName: "Название",
        flex: 2,
        editable: true,
        cellRenderer: labelRenderer(hasChildren, isExpanded, toggleRow, () =>
          refreshGrid(),
        ),
      },
      {
        field: "category",
        headerName: "Категория",
        width: 120,
        valueGetter: (params: any) =>
          params.data
            ? hasChildren(params.data.id)
              ? "Группа"
              : "Элемент"
            : "",
        cellStyle: (params: any) => ({
          fontWeight: hasChildren(params.data?.id) ? "bold" : "normal",
          color: hasChildren(params.data?.id) ? "#007bff" : "#666",
        }),
      },
      {
        field: "id",
        headerName: "ID",
        width: 150,
        cellStyle: { fontFamily: "monospace" },
        valueFormatter: (params: any) =>
          params.value === undefined || params.value === null
            ? "-"
            : String(params.value),
      },
      {
        field: "parent",
        headerName: "Родитель",
        width: 150,
        editable: true,
        valueFormatter: (params: any) => {
          if (!params.value) return "-";
          const parent = getItem(params.value);
          return parent ? parent.label : String(params.value);
        },
        valueSetter: (params: any) => {
          let val = params.newValue;
          if (val === "-" || val === "") val = null;
          else {
            const parent = flattenedItems.value.find((i) => i.label === val);
            if (parent) val = parent.id;
          }
          updateItem({ ...params.data, parent: val });
          return true;
        },
      },
      {
        headerName: "Действия",
        width: 120,
        cellRenderer: actionsRenderer((id) => {
          const item = getItem(id);
          if (!item) return;
          const count = getAllChildren(id).length;
          if (
            confirm(
              count
                ? `Удалить "${item.label}" и ${count} потомков?`
                : `Удалить "${item.label}"?`,
            )
          ) {
            removeItem(id);
            refreshGrid();
          }
        }),
      },
    ];

    const defaultColDef = { sortable: true, filter: true, resizable: true };

    const addNewItem = () => {
      const newId = nextId.value++;
      addItem({ id: newId, parent: null, label: `Новый элемент ${newId}` });
      nextId.value = getNextId();
      refreshGrid();
    };

    const onCellValueChanged = (event: any) => {
      if (event.newValue === event.oldValue) return;
      if (event.colDef.field === "label") {
        updateItem({ ...event.data, label: event.newValue });
        refreshGrid();
      }
    };

    const refreshGrid = () => {
      if (agGrid.value?.api) {
        setTimeout(() => agGrid.value?.api?.refreshCells(), 0);
      }
    };

    onMounted(() => setTimeout(() => refreshGrid(), 100));

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
</style>
