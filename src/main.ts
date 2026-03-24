import { createApp } from "vue";
import App from "./App.vue";

const app = createApp(App);

app.config.errorHandler = (err, _, info) => {
  console.error("Global error:", err);
  console.error("Info:", info);
};

app.mount("#app");
