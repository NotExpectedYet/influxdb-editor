<template>
  <v-container>
    <v-data-table
      :headers="headers"
      :items="qc_records"
      sort-by="time"
      :sort-desc="true"
      :search="search"
      class="elevation-1"
    >
      <template v-slot:top>
        <v-text-field v-model="search" type="number" label="Search" class="mx-4"></v-text-field>
        <v-toolbar flat>
          <v-toolbar-title>Last {{ record_count }} QC Records</v-toolbar-title>
          <v-divider class="mx-4" inset vertical></v-divider>
          <v-spacer></v-spacer>
          <v-dialog v-model="dialog" max-width="500px">
            <v-form ref="form" v-model="valid" lazy-validation>
              <v-card>
                <v-card-title>
                  <span class="headline">{{ formTitle }}</span>
                </v-card-title>

                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col cols="12" sm="6" md="4">
                        <v-text-field
                          v-model="editedItem.product"
                          label="Product"
                          type="number"
                          :counter="11"
                          :rules="[v => v.length === 11 || 'Number must be 11 characters']"
                          required
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6" md="4">
                        <v-text-field
                          v-model="editedItem.status"
                          type="number"
                          :counter="5"
                          :rules="[v => v.length === 5 || 'Number must be 5 characters']"
                          label="Inspection Status"
                          required
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6" md="4">
                        <v-text-field
                          v-model="editedItem.user"
                          type="number"
                          :counter="6"
                          :rules="[v => v.length === 6 || 'Number must be 6 characters']"
                          label="Manufacture User Designation"
                          required
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6" md="4">
                        <v-text-field
                          v-model="editedItem.QCuser"
                          type="number"
                          :counter="6"
                          :rules="[v => v.length === 6 || 'Number must be 6 characters']"
                          label="QC User Designation"
                          required
                        ></v-text-field>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="close">
                    Cancel
                  </v-btn>
                  <v-btn color="blue darken-1" text @click="save">
                    Save
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-form>
          </v-dialog>
          <v-dialog v-model="dialogDelete" max-width="500px">
            <v-card>
              <v-card-title class="headline"
                >Are you sure you want to delete this item?</v-card-title
              >
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closeDelete">Cancel</v-btn>
                <v-btn color="blue darken-1" text @click="deleteItemConfirm">OK</v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>
      <template v-slot:item.time="{ item }">
        {{ humanReadableDate(item.time) }}
      </template>
      <template v-slot:item.actions="{ item }">
        <v-icon small class="mr-2" @click="editItem(item)">
          mdi-pencil
        </v-icon>
        <v-icon small @click="deleteItem(item)">
          mdi-delete
        </v-icon>
      </template>
      <template v-slot:no-data>
        <v-btn color="primary" @click="initialize">
          Reset
        </v-btn>
      </template>
    </v-data-table>
    <ErrorPopUp :last-error="last_error" :error-dialog="error_dialog" />
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
    tab: null,
    record_count: 100,
    search: "",
    dialog: false,
    dialogDelete: false,
    last_error: "",
    error_dialog: false,
    valid: false,
    headers: [
      {
        text: "Date Scanned",
        align: "center",
        sortable: true,
        value: "time"
      },
      {
        text: "Product",
        align: "center",
        sortable: true,
        value: "product"
      },
      {
        text: "Status",
        align: "center",
        sortable: true,
        value: "status"
      },
      {
        text: "Manufacture User",
        align: "center",
        sortable: true,
        value: "user"
      },
      {
        text: "QC User",
        align: "center",
        sortable: true,
        value: "QCuser"
      },
      { text: "Delete", align: "center", value: "actions", sortable: false }
    ],
    qc_records: [],
    editedIndex: -1,
    editedItem: {
      product: 0,
      status: 0,
      user: 0,
      QCuser: 0
    },
    defaultItem: {
      product: 0,
      status: 0,
      user: 0,
      QCuser: 0
    }
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "New Item" : "Edit Item";
    }
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
    dialogDelete(val) {
      val || this.closeDelete();
    }
  },

  created() {
    this.initialize();
  },
  methods: {
    initialize() {
      axios
        .get("/api/qc")
        .then(res => {
          this.qc_records = res.data;
        })
        .catch(error => {
          this.last_error = error;
          this.error_dialog = true;
        });
    },

    editItem(item) {
      this.editedIndex = this.qc_records.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    saveEditItem(item) {
      let timestamp = new Date(item.time);
      timestamp = timestamp.getTime();
      item.timestamp = timestamp.toString();
      axios
        .delete(`/api/qc/${item.time}`)
        .then(() => {
          axios.post("/api/qc", item).then(() => {
            this.success_snack = true;
          });
        })
        .catch(error => {
          this.last_error = error;
          this.error_dialog = true;
        });
    },

    deleteItem(item) {
      this.editedIndex = this.qc_records.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogDelete = true;
    },

    deleteItemConfirm() {
      const body = this.qc_records[this.editedIndex];
      axios
        .delete(`/api/qc/${body.time}`)
        .then(() => {
          this.qc_records.splice(this.editedIndex, 1);
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
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    validate(item) {
      const validated = this.$refs.form.validate();
      if (validated) {
        this.saveEditItem(item);
        this.close();
      }
    },

    save() {
      if (this.editedIndex > -1) {
        Object.assign(this.qc_records[this.editedIndex], this.editedItem);
        this.validate(this.qc_records[this.editedIndex]);
      }
    },

    humanReadableDate(value) {
      return this.$luxon(value, "shorts");
    }
  }
};
</script>
