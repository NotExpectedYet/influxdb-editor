<template>
  <div class="text-center">
    <v-dialog
      v-model="errorDialog"
      width="500"
    >
      <v-card>
        <v-card-title class="headline error lighten-2">
          Error!
        </v-card-title>

        <v-card-text class="mt-5">
          Unable to contact the server! Big Whoopsy! Please log an issue on github...
          <br>
          Error: {{ lastError }}
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn
            color="error"
            text
            @click="closeErrorDialog"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: "ErrorPopUp",
  props: {
    lastError: {
      type: String,
      require: true,
      default: ""
    },
    errorDialog: {
      type: Boolean,
      require: true,
      default: false
    }
  },
  data: () => ({
  }),
  created() {},
  methods: {
    closeErrorDialog(){
      this.$emit("update:error-dialog", false)
    }
  }
};
</script>
