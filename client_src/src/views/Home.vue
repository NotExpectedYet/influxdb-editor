<template>
  <v-container
    bg
    fill-height
  >
    <v-row>
      <v-col>
        <v-data-table
          dense
          :headers="table_headers"
          :items="instances_list"
          item-key="i"
          single-line
        />
      </v-col>
    </v-row>

    <ErrorPopUp
      :last-error="last_error"
      :error-dialog.sync="error_dialog"
    />
    <AddInfluxInstance
      :instances-dialog-opened="instances_dialog_opened"
      :instances-count="instances_count"
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
    instances_list: [],
    table_headers: [
      {
        text: 'Instance #',
        align: 'start',
        filterable: false,
        value: 'i'
      },
      { text: 'Name', value: 'name' },
      { text: 'URL', value: 'url' },
      { text: 'Username', value: 'username' },
      { text: 'Password', value: 'password' },
      { text: 'Connection Status', value: 'status' }
    ]
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
