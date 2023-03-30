import { createApp } from "vue";
import "@/style.scss";
import App from "@/App.vue";
import Dashboard from "./pages/dashboard.vue";
import Content from "@/pages/content.vue";
import { createRouter, createWebHistory } from "vue-router";

const routes = [
  { path: "/", component: Dashboard },
  { path: "/content", component: Content },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

createApp(App).use(router).mount("#app");
