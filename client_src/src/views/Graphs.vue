/* eslint-disable prettier/prettier */
<template>
  <v-container>
    <v-row>
      <v-col cols="12" sm="3">
        <v-date-picker v-model="dates" range full-width></v-date-picker>
      </v-col>
      <v-col cols="12" sm="9">
        <v-card elevation="2" class="mb-5">
          <v-row>
            <v-col cols="12" sm="4">
              <v-text-field
                v-model="dateRangeText"
                label="Current Date Range"
                prepend-icon="mdi-calendar"
                readonly
              ></v-text-field
            ></v-col>
            <v-col cols="12" sm="8">
              <v-text-field
                v-model="searchInput"
                prepend-icon="mdi-magnify"
                type="number"
                label="Job Number Search"
                clearable
                @keyup="searchJobNumber"
              >
              </v-text-field>
            </v-col>
            <v-col cols="12" sm="4">
              <v-btn depressed class="ma-1" color="primary" @click="setDates()">
                Set Dates to this Month
              </v-btn></v-col
            >
            <v-col cols="12" sm="8">
              <v-select
                :items="user_select_items"
                item-text="name"
                item-value="number"
                label="User Select"
                prepend-icon="mdi-account"
                persistent-hint
                return-object
                single-line
                @change="searchUserNumber"
              ></v-select>
            </v-col>
          </v-row>
        </v-card>
        <v-data-table
          :headers="headers"
          :items="finished_units"
          :items-per-page="4"
          class="elevation-1"
        ></v-data-table>
      </v-col>
      <v-col cols="12" sm="12">
        <highcharts :options="finishedUnitsOptions"></highcharts>
      </v-col>
      <v-col cols="12" sm="3">
        <v-simple-table>
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left">KPI For Production</th>
                <th class="text-left">Count</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in kpi" :key="item.status">
                <td>[{{ item.status }}] {{ item.name }}</td>
                <td>{{ item.value }}</td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-col>
      <v-col cols="12" sm="9">
        <highcharts :options="kpiProductionOptions"></highcharts>
      </v-col>
      <v-col cols="12" sm="3">
        <v-simple-table>
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left">KPI Category For Production</th>
                <th class="text-left">Count</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in kpi_categories" :key="item.category">
                <td>{{ item.category }}</td>
                <td>{{ item.value }}</td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-col>
      <v-col cols="12" sm="9">
        <highcharts :options="kpiProductionCategoryOptions"></highcharts>
      </v-col>
      <v-col cols="12" sm="3">
        <v-simple-table>
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left">User Name</th>
                <th class="text-left">Pass Count</th>
                <th class="text-left">Fail Count</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in user_kpi" :key="item.name">
                <td>{{ item.name }}</td>
                <td>{{ item.units_passed }}</td>
                <td>{{ item.units_failed }}</td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-col>
      <v-col cols="12" sm="9">
        <highcharts :options="kpiUserOptions"></highcharts>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" sm="6">
        <!-- <highcharts :options="chartOptions"></highcharts> -->
      </v-col>
    </v-row>
    <v-overlay :value="overlay">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
    <ErrorPopUp :last-error="last_error" :error-dialog="error_dialog" />
  </v-container>
</template>

<script>
import axios from "axios";
import ErrorPopUp from "@/components/errors/ErrorPopUp.vue";

export default {
  name: "Graphs",
  components: {
    ErrorPopUp: ErrorPopUp
  },
  data: () => ({
    tab: null,
    modal: false,
    dates: [],
    date: "",
    searchInput: "",
    last_month: -1,
    firstDay: "",
    lastDay: "",
    dateRange: "",
    overlay: false,
    kpi: [],
    kpi_categories: [],
    finished_units: [],
    user_select_default: {},
    user_select_items: [],
    user_kpi: [],
    headers: [
      {
        text: "Date",
        align: "start",
        sortable: true,
        value: "date"
      },
      { text: "Completed Unit Count", value: "units_complete", sortable: true },
      { text: "Total Pass Count", value: "units_pass", sortable: true },
      { text: "Total Failed Count", value: "units_failed", sortable: true }
    ],
    finishedUnitsOptions: {
      chart: {
        type: "column"
      },

      title: {
        text: "Finished Units By Day Comparison"
      },
      events: {
        load() {
          const chart = this;
          chart.showLoading("Loading...");
          setTimeout(function() {
            chart.hideLoading();
            chart.series[0].setData([1, 2, 3, 4, 5]);
          }, 3000);
        }
      },
      xAxis: {
        categories: [
          "Jan",
          "Feb",
          "Mar",
          "April",
          "May",
          "June",
          "July",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec"
        ]
      },

      yAxis: {
        allowDecimals: false,
        min: 0,
        title: {
          text: "Number of fruits"
        }
      },

      tooltip: {
        formatter: function() {
          return "<b>" + this.x + "</b><br/>" + this.series.name + ": " + this.y;
        }
      },

      plotOptions: {
        column: {
          stacking: "normal"
        }
      },
      series: []
    },
    kpiProductionOptions: {
      chart: {
        type: "column"
      },
      title: {
        text: "KPI For Production"
      },
      events: {
        load() {
          const chart = this;
          chart.showLoading("Loading...");
          setTimeout(function() {
            chart.hideLoading();
            chart.series[0].setData([1, 2, 3, 4, 5]);
          }, 3000);
        }
      },
      xAxis: {
        type: "category",
        labels: {
          rotation: -45,
          style: {
            fontSize: "13px"
          }
        }
      },
      yAxis: {
        min: 0,
        title: {
          text: "Count"
        }
      },
      legend: {
        enabled: false
      },
      tooltip: {
        pointFormat: "<b>{point.y}</b>"
      },
      series: [
        {
          name: "Count",
          data: []
        }
      ]
    },
    kpiProductionCategoryOptions: {
      chart: {
        type: "column"
      },
      title: {
        text: "KPI Categroy For Production"
      },
      events: {
        load() {
          const chart = this;
          chart.showLoading("Loading...");
          setTimeout(function() {
            chart.hideLoading();
            chart.series[0].setData([1, 2, 3, 4, 5]);
          }, 3000);
        }
      },
      xAxis: {
        type: "category",
        labels: {
          rotation: -45,
          style: {
            fontSize: "13px"
          }
        }
      },
      yAxis: {
        min: 0,
        title: {
          text: "Count"
        }
      },
      legend: {
        enabled: false
      },
      tooltip: {
        pointFormat: "<b>{point.y}</b>"
      },
      series: [
        {
          name: "Count",
          data: []
        }
      ]
    },
    kpiUserOptions: {
      chart: {
        type: "bar",
        height: 700
      },
      title: {
        text: "User Pass / Fail Count Comparison"
      },
      xAxis: {
        categories: ["Apples", "Oranges", "Pears", "Grapes", "Bananas"]
      },
      yAxis: {
        min: 0,
        title: {
          text: "Total Pass / Fail"
        }
      },
      legend: {
        reversed: true
      },
      plotOptions: {
        series: {
          stacking: "normal"
        }
      },
      tooltip: {
        formatter: function() {
          return "<b>" + this.x + "</b><br/>" + this.series.name + ": " + this.y;
        }
      },
      colors: ["#90ee7e", "#f45b5b"],
      series: [
        {
          name: "John",
          data: [5, null, 4, 7, 2]
        },
        {
          name: "Jane",
          data: [2, 2, 3, 2, 1]
        },
        {
          name: "Joe",
          data: [3, 4, 4, 2, 5]
        }
      ]
    },
    last_error: "",
    error_dialog: false,
    computed: {}
  }),
  computed: {
    dateRangeText() {
      return this.dates.join(" ~ ");
    }
  },
  watch: {
    dates: function() {
      this.updateKpi();
      this.updateKpiCategory();
      this.updateFinishedUnits();
      this.updateUsers();
    }
  },
  created() {
    this.setDates();
    this.setUserDropDown();
  },
  methods: {
    updateUsers() {
      let data = {
        dateRange: this.dates
      };
      this.overlay = true;
      axios
        .post("/charts/users", data)
        .then(res => {
          this.user_kpi = res.data.kpi;
          this.kpiUserOptions.series = res.data.chartSeries;
          this.kpiUserOptions.xAxis.categories = res.data.currentUsers;
          this.overlay = false;
        })
        .catch(error => {
          this.last_error = error;
          this.error_dialog = true;
          this.overlay = false;
        });
    },
    searchUserNumber(e) {
      this.overlay = true;
      let data = {
        user_select: e.number
      };
      axios
        .post("/charts/user_number", data)
        .then(res => {
          // KPI
          this.kpi = res.data.kpi.kpi;
          this.kpiProductionOptions.series[0].data = res.data.kpi.chartSeries;
          // KPI CATEGORY
          this.kpiProductionCategoryOptions.series[0].data = res.data.kpiCategory.chartSeries;
          this.kpi_categories = res.data.kpiCategory.kpi;
          // FINISHED UNITS
          this.finished_units = res.data.kpiUnits.finishedUnits;
          this.finishedUnitsOptions.series = res.data.kpiUnits.chartSeries;
          this.finishedUnitsOptions.xAxis.categories = res.data.kpiUnits.currentDays;
          // Users UNITS
          this.user_kpi = res.data.kpiUsers.kpi;
          this.kpiUserOptions.series = res.data.kpiUsers.chartSeries;
          this.kpiUserOptions.xAxis.categories = res.data.kpiUsers.currentUsers;
          this.overlay = false;
        })
        .catch(error => {
          this.overlay = false;
          this.last_error = error;
          this.error_dialog = true;
        });
    },
    setUserDropDown() {
      this.overlay = true;
      axios
        .get("/api/qc/user_codes")
        .then(res => {
          this.user_select_default = res.data[0];
          this.user_select_items = res.data;
        })
        .catch(error => {
          this.overlay = false;
          this.last_error = error;
          this.error_dialog = true;
        });
    },
    searchJobNumber() {
      if (this.searchInput.length === 4) {
        this.overlay = true;
        let data = {
          searchInput: this.searchInput
        };
        axios
          .post("/charts/job_number", data)
          .then(res => {
            // KPI
            this.kpi = res.data.kpi.kpi;
            this.kpiProductionOptions.series[0].data = res.data.kpi.chartSeries;
            // KPI CATEGORY
            this.kpiProductionCategoryOptions.series[0].data = res.data.kpiCategory.chartSeries;
            this.kpi_categories = res.data.kpiCategory.kpi;
            // FINISHED UNITS
            this.finished_units = res.data.kpiUnits.finishedUnits;
            this.finishedUnitsOptions.series = res.data.kpiUnits.chartSeries;
            this.finishedUnitsOptions.xAxis.categories = res.data.kpiUnits.currentDays;
            // Users UNITS
            this.user_kpi = res.data.kpiUsers.kpi;
            this.kpiUserOptions.series = res.data.kpiUsers.chartSeries;
            this.kpiUserOptions.xAxis.categories = res.data.kpiUsers.currentUsers;
            this.overlay = false;
          })
          .catch(error => {
            this.overlay = false;
            this.last_error = error;
            this.error_dialog = true;
          });
      }
    },
    updateKpi() {
      let data = {
        dateRange: this.dates
      };
      this.overlay = true;
      axios
        .post("/charts/kpi", data)
        .then(res => {
          this.kpi = res.data.kpi;
          this.kpiProductionOptions.series[0].data = res.data.chartSeries;
          this.overlay = false;
        })
        .catch(error => {
          this.last_error = error;
          this.error_dialog = true;
          this.overlay = false;
        });
    },
    updateKpiCategory() {
      let data = {
        dateRange: this.dates
      };
      this.overlay = true;
      axios
        .post("/charts/kpi_category", data)
        .then(res => {
          this.kpi_categories = res.data.kpi;
          this.kpiProductionCategoryOptions.series[0].data = res.data.chartSeries;
          this.overlay = false;
        })
        .catch(error => {
          this.last_error = error;
          this.error_dialog = true;
          this.overlay = false;
        });
    },
    updateFinishedUnits() {
      let data = {
        dateRange: this.dates
      };
      this.overlay = true;
      axios
        .post("/charts/finished_units", data)
        .then(res => {
          this.finished_units = res.data.finishedUnits;
          this.finishedUnitsOptions.series = res.data.chartSeries;
          this.finishedUnitsOptions.xAxis.categories = res.data.currentDays;
          this.overlay = false;
        })
        .catch(error => {
          this.last_error = error;
          this.error_dialog = true;
        });
    },
    setDates(month_change) {
      this.date = new Date();
      const y = this.date.getFullYear();
      let m = this.date.getMonth();
      if (month_change) {
        m = m + month_change;
      }
      this.firstDay = new Date(y, m, 1);
      this.lastDay = new Date(y, m + 1, 0);
      this.dates = [this.formatDates(this.firstDay), this.formatDates(this.lastDay)];
    },
    formatDates(date) {
      var d = new Date(date),
        month = "" + (d.getMonth() + 1),
        day = "" + d.getDate(),
        year = d.getFullYear();

      if (month.length < 2) month = "0" + month;
      if (day.length < 2) day = "0" + day;

      return [year, month, day].join("-");
    },

    humanReadableDate(value) {
      return this.$luxon(value, "shorts");
    }
  }
};
</script>
