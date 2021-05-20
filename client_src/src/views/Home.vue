<template>
  <v-container
    bg
    fill-height
  >
    <ErrorPopUp
      :last-error="last_error"
      :error-dialog.sync="error_dialog"
    />
    <AddInfluxInstance
      :instances-dialog-opened="instances_dialog_opened"
      :instances-count="instances_count"
      :instances-list="instances_list"
    />
  </v-container>
</template>

<script>
import axios from "axios";
import ErrorPopUp from "@/components/errors/ErrorPopUp.vue";
import AddInfluxInstance from "@/components/modals/addInfluxInstance.vue";

export default {
  name: "Home",
  components: {
    ErrorPopUp: ErrorPopUp,
    AddInfluxInstance: AddInfluxInstance
  },
  data: () => ({
    last_error: "",
    error_dialog: false,
    instances_dialog_opened: false,
    instances_count: 0,
    instances_list: []
  }),
  mounted() {
    this.checkForInstances();
  },
  methods: {
    checkForInstances(){
        axios
        .get("/api/instances")
        .then(res => {
          this.instances_count = res.data.length;
          this.instances_list = res.data;
          if(res.data.length === 0){
            this.instances_dialog_opened = true;
          }
        })
        .catch(error => {
          this.last_error = error.msg;
          this.error_dialog = true;
          this.overlay = false;
        });
    }
  }
};
</script>
