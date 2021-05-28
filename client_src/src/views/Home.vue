<template>
  <v-container
    bg
    fill-height
  >
    <v-row>
      <v-col>
        <v-card>
          <v-card-title>
            <v-icon>mdi-database</v-icon> Influx Instance Management
            <v-spacer />
            <v-btn
              class="ma-2"
              color="secondary"
              @click="instances_dialog_opened = true"
            >
              <v-icon>mdi-database-plus</v-icon> Add
            </v-btn>
            <!-- <v-text-field
              v-model="instance_search"
              append-icon="mdi-magnify"
              label="Search"
              single-line
              hide-details
            /> -->
          </v-card-title>
          <v-data-table
            dense
            :headers="table_headers"
            :items="instances_list"
            item-key="id"
            single-line
            :search="instance_search"
          >
            <template v-slot:item.status="{ item }">
              <v-avatar
                v-if="item.status"
                dense
                size="35"
                color="success"
              >
                <v-icon dark>
                  mdi-lan-connect
                </v-icon>
              </v-avatar>
              <v-avatar
                v-if="!item.status"
                dense
                size="35"
                color="error"
              >
                <v-icon dark>
                  mdi-lan-disconnect
                </v-icon>
              </v-avatar>
            </template>
            <template v-slot:item.actions="{ item }">
              <v-icon
                class="mr-2"
                @click="refreshItem(item)"
              >
                mdi-database-refresh
              </v-icon>
              <v-icon
                class="mr-2"
                @click="editItem(item)"
              >
                mdi-database-edit
              </v-icon>
              <v-icon
                @click="deleteItem(item)"
              >
                mdi-database-remove
              </v-icon>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
    <!-- TODO
    Move this to component -->
    <v-dialog
      v-model="instance_delete_dialog"
      max-width="500px"
    >
      <v-card>
        <v-toolbar
          dark
          color="error"
        >
          <v-toolbar-items>
            <v-btn
              dark
              text
              @click="closeDelete"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-toolbar-items>
          <v-toolbar-title>
            Are you sure you want to delete this item?
          </v-toolbar-title>
        </v-toolbar>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="blue darken-1"
            text
            @click="deleteItemConfirm"
          >
            Yes
          </v-btn>
          <v-spacer />
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- TODO
    Move this to component -->
    <v-dialog
      v-model="instance_edit_dialog"
      persistent
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar
          dark
          color="warning"
        >
          <v-toolbar-items>
            <v-btn
              dark
              text
              @click="instance_edit_dialog = false"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-toolbar-items>
          <v-toolbar-title>
            {{ formTitle }}
          </v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col
                xs="12"
                sm="12"
                md="6"
                lg="4"
                xl="4"
              >
                <v-text-field
                  v-model="edited_item.url"
                  label="URL"
                />
              </v-col>
              <v-col
                xs="12"
                sm="12"
                md="6"
                lg="4"
                xl="4"
              >
                <v-text-field
                  v-model="edited_item.name"
                  label="Name"
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
                  v-model="edited_item.username"
                  label="Username"
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
                  v-model="edited_item.password"
                  label="Password"
                />
              </v-col>
            </v-row>
            <v-btn
              color="success"
              @click="saveEditedItem"
            >
              Save
            </v-btn>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>
    <ErrorPopUp
      :last-error="last_error"
      :error-dialog.sync="error_dialog"
    />
    <AddPopUp
      :instances-dialog-opened.sync="instances_dialog_opened"
      :instances-count.sync="instances_count"
      :instances-list.sync="instances_list"
    />
    <Snackbar
      :snackbar-open.sync="snackbar_open"
      :snackbar-message="snackbar_message"
      :snackbar-notification-type="snackbar_notification_type"
    />
  </v-container>
</template>

<script>
import axios from "axios";
import ErrorPopUp from "@/components/errors/ErrorPopUp.vue";
import AddPopUp from "@/components/modals/AddPopUp.vue";
import Snackbar from "@/components/modals/Snackbar.vue";

export default {
  name: "Home",
  components: {
    ErrorPopUp: ErrorPopUp,
    AddPopUp: AddPopUp,
    Snackbar: Snackbar
  },
  data: () => ({
    last_error: "",
    error_dialog: false,
    instances_dialog_opened: false,
    instances_count: 0,
    instances_list: [],
    instance_search: "",
    instance_edit_dialog: false,
    instance_delete_dialog: false,
    edited_item_index: -1,
    edited_item: {},
    snackbar_open: false,
    snackbar_message: "",
    snackbar_notification_type: "",
    table_headers: [
      {
        text: '#',
        align: 'center',
        filterable: false,
        value: 'id'
      },
      { text: 'Name', align: 'center',value: 'name' },
      { text: 'URL', align: 'center', value: 'url' },
      { text: 'Username', align: 'center', value: 'username' },
      { text: 'Password', align: 'center',value: 'password' },
      { text: 'Database Count', align: 'center', value: 'databases.length' },
      { text: 'Connection Status', align: 'center', value: 'status' },
      { text: 'Actions', value: 'actions', sortable: false }
    ]
  }),
  computed: {
      formTitle () {
        return this.editedIndex === -1 ? 'New Item' : 'Edit Item'
      }
  },
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
    },
    editItem(item){
      this.edited_item = Object.assign({}, item)
      this.instance_edit_dialog = true;
    },
    deleteItem(item){
      this.edited_item_index = item.id;
      this.instance_delete_dialog = true;
    },
    refreshItem(item){
      this.snackbar_open = true;
      this.snackbar_message = `${item.url} is refreshing...`
      this.snackbar_notification_type = "warning"
      axios
        .get("/api/instances/refresh/"+item.id)
        .then(res => {
          this.snackbar_open = false;
          this.instances_list[item.id] = res.data;
          return this.instances_list[item.id].status;
        }).then(status => {
          this.snackbar_open = true;
          this.snackbar_message = `${item.url} is refreshed! Status is ${this.statusConvert(status)}`
          this.snackbar_notification_type = "warning"
        })
        .catch(error => {
          this.last_error = error.toString();
          this.error_dialog = true;
          this.overlay = false;
        });
    },
    statusConvert(status){
      if(status){
        return "Online"
      }else{
        return "Offline"
      }
    },
    saveEditedItem(){
      axios
      .put("/api/instances/"+this.edited_item_index, this.edited_item)
      .then(() => {
        this.instance_edit_dialog = false;
        this.checkForInstances();
      }).catch(e => {
        console.log(e)
        this.instance_edit_dialog = false;
      });
    },
    deleteItemConfirm () {
      axios
      .delete("/api/instances/"+this.edited_item_index)
      .then(() => {
        this.closeDelete();
        this.instances_list.splice(this.edited_item_index, 1)
        this.checkForInstances();
      }).catch(e => {
        console.log(e)
        this.closeDelete();
      });
    },
    closeDelete () {
        this.edited_item_index = -1;
        this.instance_delete_dialog = false;
    }
  }
};
</script>
