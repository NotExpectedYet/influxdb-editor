<template>
  <div class="text-center ma-2">
    <v-snackbar
      :colour="snackbarNotificationType"
      :value="snackbarOpen"
      :timeout="timeout"
      @input="closeSnackBar"
    >
      {{ snackbarMessage }}

      <template v-slot:action="{ attrs }">
        <v-btn
          color="green"
          text
          v-bind="attrs"
          @click="closeSnackBar"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>

export default {
  name: "AddPopUp",
  props: {
    snackbarOpen: {
      type: Boolean,
      require: true,
      default: false
    },
    snackbarMessage: {
      type: String,
      require: true,
      default: ""
    },
    snackbarNotificationType: {
      type: String,
      require: true,
      default: "success"
    }
  },
  data: () => ({
    timeout: 4000
  }),
  created() {
  },
  mounted() {
  },
  methods: {
    closeSnackBar(){
      this.$emit("update:snackbarOpen", false)
    }
  }
};
</script>
