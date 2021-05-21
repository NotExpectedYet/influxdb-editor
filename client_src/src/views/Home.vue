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
              @click="openAddInstancesDialog"
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
            item-key="name"
            single-line
            :search="instance_search"
          >
            <template v-slot:item.status="{ item }">
              <v-btn
                v-if="item.status"
                dark
                small
                color="success"
              >
                <v-icon dark>
                  mdi-lan-connect
                </v-icon>
              </v-btn>
              <v-btn
                v-if="!item.status"
                dark
                small
                color="error"
              >
                <v-icon dark>
                  mdi-lan-disconnect
                </v-icon>
              </v-btn>
            </template>
            <template v-slot:item.actions="{ item }">
              <v-icon
                small
                class="mr-2"
                @click="editItem(item)"
              >
                mdi-database-edit
              </v-icon>
              <v-icon
                small
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
            OK
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
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-btn
            color="success"
            class="ma-4"
            @click="saveEditedItem"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <ErrorPopUp
      :last-error="last_error"
      :error-dialog.sync="error_dialog"
    />
    <AddInfluxInstance
      :instances-dialog-opened.sync="instances_dialog_opened"
      :instances-count.sync="instances_count"
      :instances-list.sync="instances_list"
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
    instance_search: "",
    instance_edit_dialog: false,
    instance_delete_dialog: false,
    edited_item_index: -1,
    edited_item: {},
    table_headers: [
      {
        text: '#',
        align: 'center',
        filterable: false,
        value: 'i'
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
    openAddInstancesDialog(){
      this.instances_dialog_opened = true;
    },
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
      this.edited_item_index = item.i;
      this.instance_delete_dialog = true;
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
