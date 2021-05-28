<template>
  <v-app>
    <Toolbar />
    <!-- Sizes your content based upon application components -->
    <v-main>
      <!-- Provides the application the proper gutter -->
      <v-container
        fluid
        class="pa-0"
      >
        <!-- If using vue-router -->
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import Vue from "vue";
import Toolbar from "@/components/Toolbar.vue";
import VueLuxon from "vue-luxon";
import HighchartsVue from "highcharts-vue";
import Highcharts from "highcharts";
import DatetimePicker from 'vuetify-datetime-picker'

import dark_blue from "@/components/themes/monokai.js";
Highcharts.theme = dark_blue;
Highcharts.setOptions(Highcharts.theme);
Vue.use(HighchartsVue, { Highcharts });

Vue.use(VueLuxon);
Vue.use(DatetimePicker)

export default Vue.extend({
  name: "App",
  components: { Toolbar },
  data: () => ({}),
  watch: {
    $route: {
      immediate: true,
      handler(to) {
        document.title = `Influx Manager: ${to.name}` || "QC System";
      }
    }
  }
});
</script>
<style>
main {
  background-color: #222;
  background-attachment: fixed;
  background-repeat: no-repeat;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
  background-position: center;
}
</style>
