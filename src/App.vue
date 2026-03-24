<template>
  <div id="app">
    <h1>MStroy Frontend - Тестовое задание</h1>
    <TreeTable :initial-data="testData" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import TreeTable from "./components/TreeTable.vue";

export default defineComponent({
  name: "App",
  components: {
    TreeTable,
  },
  setup() {
    const testData = [
      { id: 1, parent: null, label: "Айтем 1" },
      { id: "91064cee", parent: 1, label: "Айтем 2" },
      { id: 3, parent: 1, label: "Айтем 3" },
      { id: 4, parent: "91064cee", label: "Айтем 4" },
      { id: 5, parent: "91064cee", label: "Айтем 5" },
      { id: 6, parent: "91064cee", label: "Айтем 6" },
      { id: 7, parent: 4, label: "Айтем 7" },
      { id: 8, parent: 4, label: "Айтем 8" },
    ];

    return {
      testData,
    };
  },
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

h1 {
  margin-bottom: 20px;
  color: #333;
  font-size: 24px;
}
</style>
