import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import Records from "../views/Records.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Dashboard",
    component: Home
  },
    {
    path: "/records",
    name: "Record Editor",
    component: Records
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
