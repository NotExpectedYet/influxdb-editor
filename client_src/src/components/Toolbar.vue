<template>
  <span>
    <v-app-bar dense>
      <v-tabs
        dense
        class="ml-2"
      >
        <v-tab
          v-for="(nav, i) in navigation"
          :key="i"
          class="hidden-sm-and-down"
          :to="nav.path"
        >{{
          nav.name
        }}</v-tab>
      </v-tabs>
      <v-app-bar-nav-icon
        class="hidden-md-and-up"
        right
        @click.stop="drawer = !drawer"
      />
    </v-app-bar>
    <v-navigation-drawer
      v-model="drawer"
      absolute
      temporary
      right
    >
      <v-list dense>
        <v-list-item
          v-for="(nav, i) in navigation"
          :key="i"
          :to="nav.path"
        >
          <v-list-item-content>
            <v-list-item-title>{{ nav.name }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </span>
</template>

<script>
export default {
  name: "Toolbar",
  components: {},
  data: () => ({
    navigation: null,
    drawer: null,
    menu_reload_key: 0
  }),
  beforeMount() {
    // Pull in navigation from routes and load into DOM
    this.navigation = this.$router.options.routes;
  }
};
</script>
