<template>
  <v-container
    bg
    fill-height
  >
    <v-row>
      <v-col>
        <v-card
          class="pa-5"
          dense
        >
          <v-row>
            <v-col
              xs="12"
              sm="12"
              md="6"
              lg=""
              xl="3"
            >
              <v-select
                v-model="instances_list_selected"
                :hint="`${instances_list_selected.id}: ${instances_list_selected.name}`"
                :items="instances_list"
                item-text="name"
                item-value="i"
                label="Instance"
                persistent-hint
                return-object
                single-line
                @change="changeInstance()"
              />
            </v-col>
            <v-col
              xs="12"
              sm="12"
              md="6"
              lg="3"
              xl="3"
            >
              <v-select
                v-model="databases_list_selected"
                :hint="`${databases_list_selected}`"
                :items="databases_list"
                item-text="name"
                item-value="i"
                label="Database"
                persistent-hint
                return-object
                single-line
                @change="changeDatabase()"
              />
            </v-col>
            <v-col
              xs="12"
              sm="12"
              md="6"
              lg="3"
              xl="3"
            >
              <v-select
                v-model="measurement_list_selected"
                :hint="`${measurement_list_selected}`"
                :items="measurement_list"
                item-text="name"
                item-value="i"
                label="Measurement"
                persistent-hint
                return-object
                single-line
                @change="loadDatabaseTable()"
              />
            </v-col>
            <v-col
              xs="12"
              sm="12"
              md="6"
              lg="3"
              xl="3"
            >
              <v-text-field
                v-model="record_limit"
                type="Number"
                hint="This field changes the amount of records pulled from the database"
                label="Record Limit"
              />
            </v-col>
            <!-- <v-col
        xs="12"
        sm="12"
        md="6"
        lg="2"
        xl="1"
      >
        <v-card>
          <v-text-field
            v-model="record_limit"
            type="Number"
            hint="This field changes the amount of records pulled from the database"
            label="Date Sort"
          />
        </v-card>
      </v-col> -->
          </v-row>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-card>
          <v-card-title>
            <v-icon>mdi-format-list-bulleted</v-icon> Last {{ record_limit }} "{{ measurement_list_selected }}" Records
            <v-spacer />
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Search"
              single-line
              hide-details
            />
            <v-btn
              class="ma-2"
              color="secondary"
              @click="insert_dialog = true"
            >
              <v-icon>mdi-playlist-plus</v-icon> Insert Record
            </v-btn>
          </v-card-title>
          <v-data-table
            v-model="record_values"
            dense
            :headers="record_headers"
            :items="record_values"
            :loading="record_values_loading"
            loading-text="Loading... Please wait"
            sort-by="time"
            :sort-desc="true"
            :search="search"
          >
            <template v-slot:item.time="{ item }">
              {{ humanReadableDate(item.time) }}
            </template>
            <template v-slot:item.actions="{ item }">
              <v-icon
                class="mr-2"
                @click="editItem(item)"
              >
                mdi-playlist-edit
              </v-icon>
              <v-icon
                @click="deleteItem(item)"
              >
                mdi-playlist-remove
              </v-icon>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-dialog
        v-model="insert_dialog"
        persistent
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
                @click="insert_dialog = false"
              >
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-toolbar-items>
            <v-toolbar-title>
              Insert New Record
            </v-toolbar-title>
          </v-toolbar>
          <v-form
            ref="form"
            lazy-validation
            class="mx-15 mt-5"
          >
            <v-row>
              <v-col
                v-for="record in record_headers"
                :key="record.value"
                xs="12"
                sm="12"
                md="12"
                lg="4"
                xl="4"
              >
                <v-datetime-picker
                  v-if="record.value === 'time'"
                  v-model="datetime"
                  :label="record.text"
                  date-format="dd-MM-yyyy"
                >
                  <template slot="dateIcon">
                    <v-icon>mdi-calendar-range</v-icon>
                  </template>
                  <template slot="timeIcon">
                    <v-icon>mdi-clock-time-five</v-icon>
                  </template>
                </v-datetime-picker>
                <v-text-field
                  v-if="record.value !== 'actions' && record.value !== 'time'"
                  :label="record.text"
                />
              </v-col>
            </v-row>

            <v-btn
              color="success"
              class="ma-4"
              @click="insertNewRecord"
            >
              Save
            </v-btn>
          </v-form>
          <v-spacer />
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="delete_dialog"
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
        v-model="edit_dialog"
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
                @click="edit_dialog = false"
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
              <v-form
                ref="form"
                lazy-validation
                class="mx-15 mt-5"
              >
                <v-row>
                  <v-col
                    v-for="(record, index) in record_headers"
                    :key="record.value"
                    xs="12"
                    sm="12"
                    md="12"
                    lg="4"
                    xl="4"
                  >
                    <v-datetime-picker
                      v-if="record.value === 'time'"
                      v-model="datetime"
                      :label="edited_item[index]"
                      date-format="MM/dd/yyyy"
                      time-format="HH:mm:ss"
                    >
                      <template slot="dateIcon">
                        <v-icon>mdi-calendar-range</v-icon>
                      </template>
                      <template slot="timeIcon">
                        <v-icon>mdi-clock-time-five</v-icon>
                      </template>
                    </v-datetime-picker>
                    <v-text-field
                      v-if="record.value !== 'time' && record.value !== 'actions'"
                      :value="edited_item[record.value]"
                      :label="record.text"
                    />
                  </v-col>
                </v-row>

                <v-btn
                  color="success"
                  @click="saveEditItem"
                >
                  Save
                </v-btn>
              </v-form>
            </v-container>
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-row>
    <ErrorPopUp
      :last-error="last_error"
      :error-dialog.sync="error_dialog"
    />
  </v-container>
</template>

<script>
import axios from "axios";
import ErrorPopUp from "@/components/errors/ErrorPopUp.vue";

export default {
  name: "Records",
  components: {
    ErrorPopUp: ErrorPopUp
  },
  data: () => ({
    last_error: "",
    error_dialog: false,
    search: "",
    instances_list: [{ i: 0, name: "Loading..." }],
    instances_list_selected: { i: 0, name: "Loading..." },
    databases_list: ["Loading..."],
    databases_list_selected: "Loading...",
    measurement_list: ["Loading..."],
    measurement_list_selected: "Loading...",
    record_headers: [],
    record_values: [],
    record_limit: 1000,
    record_values_loading: true,
    edited_index: -1,
    edited_item: {},
    instances_override: 1,
    insert_dialog: false,
    edit_dialog: false,
    delete_dialog: false,
    datetime: null
  }),

  computed: {
    formTitle() {
      return this.edited_index === -1 ? "New Item" : "Edit Item";
    }
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
    delete_dialog(val) {
      val || this.closeDelete();
    }
  },
  created() {
    this.checkForInstances();
  },
  methods: {
    setPageLoading(loading){
      this.record_values_loading = loading;
    },
    checkForInstances(){
        this.setPageLoading(true);
        axios
        .get("/api/instances")
        .then(res => {
          let current_online_instances = [];
          res.data.forEach(instance => {
            if(instance.status){
              current_online_instances.push(instance)
            }
          })
          if(current_online_instances.length > 0){
            this.instances_list = current_online_instances;
            this.instances_list_selected = current_online_instances[0];
            this.databases_list = current_online_instances[0].databases;
            this.databases_list_selected = current_online_instances[0].selected_database;
            this.measurement_list = current_online_instances[0].measurement_names;
            this.measurement_list_selected = current_online_instances[0].selected_measurement;
          }
        }).then(() => {
          this.loadDatabaseTable();
        })
        .catch(error => {
          this.last_error = error.msg;
          this.error_dialog = true;
          this.overlay = false;
        }).finally( () => {
          this.setPageLoading(false);  
        });
    },
    changeInstance(){
      this.setPageLoading(true);
        axios
        .get("/api/instances/"+this.instances_list_selected.id+"/null")
        .then(res => {
          this.databases_list = res.data.databases;
          this.databases_list_selected = res.data.selected_database;
          this.measurement_list = res.data.measurement_names;
          this.measurement_list_selected = res.data.selected_measurement;
        }).then(() => {
          this.loadDatabaseTable();
        })
        .catch(error => {
          this.last_error = error.msg;
          this.error_dialog = true;
          this.overlay = false;
        }).finally( () => {
          this.setPageLoading(false);  
        });
    },
    changeDatabase(){
      this.setPageLoading(true);
        axios
        .get("/api/instances/"+this.instances_list_selected.id+"/"+this.databases_list_selected)
        .then(res => {
          this.measurement_list = res.data.measurement_names;
          this.measurement_list_selected = res.data.selected_measurement;
        }).then(() => {
          this.loadDatabaseTable();
        })
        .catch(error => {
          console.error(error)
          this.last_error = error.msg;
          this.error_dialog = true;
          this.overlay = false;
        }).finally( () => {
          this.setPageLoading(false);  
        });
    },
    loadDatabaseTable(){
      this.setPageLoading(true);
        axios
        .get(`/api/databases/${this.instances_list_selected.id}/${this.databases_list_selected}/${this.measurement_list_selected}/${this.record_limit}`)
        .then(res => {
          this.record_values = res.data.tableData;
          this.record_headers = res.data.tableHeaders;
        })
        .catch(error => {
          this.last_error = error.msg;
          this.error_dialog = true;
          this.overlay = false;
        }).finally( () => {
          this.setPageLoading(false);  
        });
    },
    editItem(item) {
      this.edit_dialog = true;
      this.edited_index = this.record_values.indexOf(item);
      this.edited_item = Object.assign({}, item);
      this.datetime = this.humanReadableDate(this.edited_item["time"]).replace(",", "").slice(0, -2);
      console.log(this.datetime)
      this.dialog = true;
    },

    saveEditItem(item) {
      let timestamp = new Date(item.time);
      timestamp = timestamp.getTime();
      item.timestamp = timestamp.toString();
      axios
        .delete(`/api/databases/${item.time}`)
        .then(() => {
          axios.post("/api/databases", item).then(() => {
            this.success_snack = true;
          });
        })
        .catch(error => {
          this.last_error = error;
          this.error_dialog = true;
        });
    },

    deleteItem(item) {
      this.edited_index = this.record_values.indexOf(item);
      this.edited_item = Object.assign({}, item);
      this.delete_dialog = true;
    },

    deleteItemConfirm() {
      const body = this.record_values[this.edited_index];
      axios
        .delete(`/api/databases/${body.time}`)
        .then(() => {
          this.record_values.splice(this.edited_index, 1);
        })
        .catch(error => {
          this.last_error = error;
          this.error_dialog = true;
        })
        .finally(() => {
          this.closeDelete();
        });
    },

    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.edited_item = Object.assign({}, this.defaultItem);
        this.edited_index = -1;
      });
    },

    closeDelete() {
      this.delete_dialog = false;
      this.$nextTick(() => {
        this.edited_item = Object.assign({}, this.defaultItem);
        this.edited_index = -1;
      });
    },
    insertNewRecord(){

    },
    save() {
      if (this.edited_index > -1) {
        Object.assign(this.record_values[this.edited_index], this.edited_item);
        this.validate(this.record_values[this.edited_index]);
      }
    },

    humanReadableDate(value) {
      return this.$luxon(value, "shorts");
    }
  }
};
</script>
