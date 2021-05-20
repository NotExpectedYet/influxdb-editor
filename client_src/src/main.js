import Vue from "vue";
// Plugins
import VueClipboard from "vue-clipboard2";

// Vue
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store/store";
import vuetify from "./plugins/vuetify";

Vue.config.productionTip = false;

// Plugin declaration
Vue.use(VueClipboard);

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount("#app");
