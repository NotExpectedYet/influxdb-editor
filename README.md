# InfluxDB Manager
A webserver for managing and editing influxdb... 

# Road to V1. - Not an exausive list, may be edited in the future as the application progresses out of my brain.
 - [x] Web server backend written in nodejs + express.
 - [x] GUI frontend written in VueJS + Vuetify
 - [ ] Simple login and authentication system
 - [x] Allow connection to influx v1.x instances
 - [x] Add influx instance to internal database
 - [x] Get measurements list on initial api call
 - [ ] Disable pages when no instances available
 - [ ] Validation on inputs
 - [ ] Allow connection to influx v2.x instances (may work already not tested)
 - [ ] Allow to create new influxDB database
 - [x] Scan current database list
 - [x] Select database for managing 
 - [x] Show records of database
 - [x] Allow switching between instances, databases, measurements.
 - [x] Disable selection for any offline instances.
 - [ ] Allow editing, deleting and inserting of records
 - [ ] Allow filtering on records: Date range, specific key is "<,>,=".
 - [ ] Allow for graphing solutions on current data.
 - [ ] Statistics on database in dashboard.
 - [ ] Update readme with installation/setup instructions. 
 - [ ] General code neaten up.
 - [ ] Global error handler for server. 
