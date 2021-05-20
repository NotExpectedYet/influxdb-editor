<template>
  <v-row justify="center">
    <v-dialog
      v-model="instancesDialogOpened"
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar
          dark
          color="primary"
        >
          <v-toolbar-items>
            <v-btn
              dark
              text
              disabled
              @click="closeAddInstanceDialog"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-toolbar-items>
          <v-toolbar-title v-if="instanceCount === 0">
            {{ no_instances.message }}
          </v-toolbar-title>
          <v-toolbar-title v-else>
            {{ instances.message }}
          </v-toolbar-title>
        </v-toolbar>
        <v-alert
          v-model="error_alert"
          dense
          outlined
          type="error"
          class="ma-5"
          dismissible
        >
          The following errors have occured whilst adding your database! <br>
          <span v-html="error_message" />
        </v-alert>
        <v-form
          ref="form"
          v-model="instance_form_valid"
          lazy-validation
          class="mx-15 mt-5"
        >
          <v-row>
            <v-col 
              xs="12"
              sm="12"
              md="12"
              lg="4"
              xl="4"
            >
              <v-text-field
                v-model="url"
                label="Instance URL"
                placeholder="http://192.168.1.5:8086"
                hint="The URL of your instance, must include http/https"
              />
            </v-col>
            <v-col 
              xs="12"
              sm="12"
              md="12"
              lg="4"
              xl="4"
            >
              <v-text-field
                v-model="name"
                label="Instance Name"
                hint="Custom name for your instance"
              />
            </v-col>
            <v-col 
              xs="12"
              sm="12"
              md="6"
              lg="2"
              xl="2"
            >
              <v-text-field
                v-model="username"
                label="Username"
                hint="Leave blank if authentication is disabled"
              />
            </v-col>
            <v-col 
              xs="12"
              sm="12"
              md="6"
              lg="2"
              xl="2"
            >
              <v-text-field
                v-model="password"
                label="Password"
                hint="Leave blank if authentication is disabled"
              />
            </v-col>
          </v-row>

          <v-btn
            :disabled="!instance_form_valid"
            color="success"
            class="mr-4 mt-2"
            @click="addInstance"
          >
            Add
          </v-btn>

          <v-btn
            color="warning"
            class="mt-2"
            @click="testInstanceConnection"
          >
            Test Connection
          </v-btn>
        </v-form>
        <v-spacer />
        <v-alert
          v-model="success_alert"
          dense
          outlined
          type="success"
          class="ma-5"
          dismissible
        >
          Successfully added your database and found these databases! <br>
          <span v-html="instance_databases" />
        </v-alert>
        <v-data-table
          dense
          :headers="table_headers"
          :items="instancesList"
          item-key="i"
          single-line
          class="ma-15"
        />
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import axios from "axios";

export default {
  name: "AddInfluxInstance",
  props: {
    instancesDialogOpened: {
      type: Boolean,
      require: true,
      default: false
    },
    instanceCount: {
      type: Number,
      require: true,
      default: 0
    },
    instancesList: {
      type: Array,
      require: true,
      default: () => {
            return []
      }
    }
  },
  data: () => ({
    url: "",
    name: "",
    username: "",
    password: "",
    error_message: "",
    error_alert: false,
    instance_databases: "",
    success_alert: false,
    no_instances: {
      message: "No influx instances detected! Please setup below..."
    },
    instances: {
      message: "Add influx instances below..."
    },
    instance_form_valid: true,
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
  created() {},
  methods: {
    closeAddInstanceDialog(){
      this.$emit("update:instances-dialog-opened", false)
    },
    addInstance(){
        this.error_message = "";
        this.alert = false;
        let instace_options = {
          url: this.url,
          name: this.name,
          username: this.username,
          password: this.password
        };
        axios
        .post("/api/instances", instace_options)
        .then(res => {
          console.log(res.data)
          if(res.data.errors.length > 0){
            res.data.errors.forEach((e, index) => {
              this.error_message += `${index}. ${e}<br>`
            })
            this.error_alert = true;
          }else{
            res.data.databaseList.forEach((d, index) => {
              this.instance_databases += `${index}. ${d}<br>`
            })
            this.success_alert = true;
          }
        })
        .catch(error => {
          this.last_error = error.msg;
        });
    },
    testInstanceConnection(){
      this.$emit("update:instances-dialog-opened", false)
    }
}
};
</script>
