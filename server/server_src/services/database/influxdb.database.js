const Influx = require("influx");
const { findIndex, cloneDeep } = require("lodash")

const { influx_instances_db, grabDataPoint, writeDataPoint, deleteDataPoint, updateDataPoint } = require("./lowdb.database.js");
const { addNewInfluxInstanceToCache, removeInstanceFromCache, updateInfluxInstanceToCache, getInfluxInstanceCache, resetInfluxInstanceCache } = require("../../cache/influxdb.cache.js");
const { createInfluxOptions, createInfluxURL, } = require("../../utils/influx.utils.js");

async function influxInstanceConnect() {
    // System Start Up, grab instances from database.
    const currentInfluxInstanceList = grabDataPoint(influx_instances_db);

    for (let i = 0; i < currentInfluxInstanceList.length; i++) {
        const cd = currentInfluxInstanceList[i];

        // Create influx database connection
        const influx_url = createInfluxURL(cd.protocol, cd.host, cd.port)
        const options = createInfluxOptions(influx_url, cd.username, cd.password);
        let new_instance = new Influx.InfluxDB(options);

        let influx_instance = {
            id: cd.i,
            name: cd.name,
            url: influx_url,
            instance: new_instance,
            status: false,
            username: cd.username,
            password: cd.password
        }
        addNewInfluxInstanceToCache(influx_instance);
        // Test to see if instance is alive
        console.warn(`Checking instance ${cd.i} connection...`)
        const status = await testInstanceConnection(influx_instance.id);
        updateInfluxInstanceToCache({ id:influx_instance.id, key: "status", value: status })
        //If alive we can grab measurements, database names
        if (status) {
            console.warn(`Getting ${cd.i} database names`)
            const databases = await getInstanceDatabaseNames(influx_instance.id);
            //We have databases, need to update the cache with a default selection
            updateInfluxInstanceToCache({ id: influx_instance.id, key: "selected_database", value: databases[0] })
            updateInfluxInstanceToCache({ id:influx_instance.id, key: "databases", value: databases })
            console.warn(`Detected ${databases.length} databases`);
            // Grab the measurement lists for initial database
            console.warn(`Getting ${cd.i} measurement names`)
            const measurement_names = await getMeasurementNames(influx_instance.id);
            updateInfluxInstanceToCache({ id: influx_instance.id, key: "selected_measurement", value: measurement_names[0] })
            updateInfluxInstanceToCache({ id:influx_instance.id, key: "measurement_names", value: measurement_names })
        }

    }

}
async function addInfluxInstance({ url = undefined, name = undefined, username = undefined, password = undefined }) {
    let errors = [];

    if (!url.includes("http")) {
        errors.push("Invalid URL!")
        return [ errors ]
    }

    if (!errors.length > 0) {

        // Create influx database connection
        const options = createInfluxOptions(url, username, password);
        let new_instance = new Influx.InfluxDB(options);

        const currentInfluxInstanceList = grabDataPoint(influx_instances_db);

        let instanceIndex = currentInfluxInstanceList.length;

        if (instanceIndex === 0) {
            instanceIndex = currentInfluxInstanceList.length + 1;
        } else {
            instanceIndex = currentInfluxInstanceList.length;
        }

        const saveConnectionCache = {
            id: instanceIndex,
            name: name,
            instance: new_instance,
            status: false,
            url,
            instance: new_instance,
            username,
            password
        }

        const saveDatabase = {
            i: instanceIndex,
            name: name,
            protocol: options.protocol,
            port: options.port,
            host: options.host,
            username: username,
            password: password
        }
        const database_index = findIndex(currentInfluxInstanceList, function(o) {
                return o.name == name
        })

        if (database_index !== -1) {
            errors.push("Instance already exists");
            return { errors }
        } else {
            writeDataPoint(influx_instances_db, saveDatabase)

            addNewInfluxInstanceToCache(saveConnectionCache);
            const status = await testInstanceConnection(saveConnectionCache.id);
            updateInfluxInstanceToCache({ id:saveConnectionCache.id, key: "status", value: status })
            //If alive we can grab measurements, database names
            let databases;
            if (status) {
                console.warn(`Getting ${saveConnectionCache.id} database names`)
                databases = await getInstanceDatabaseNames(saveConnectionCache.id);
                //We have databases, need to update the cache with a default selection
                updateInfluxInstanceToCache({ id: saveConnectionCache.id, key: "selected_database", value: databases[0] })
                updateInfluxInstanceToCache({ id: saveConnectionCache.id, key: "databases", value: databases })
                console.warn(`Detected ${databases.length} databases`);
                // Grab the measurement lists for initial database
                console.warn(`Getting ${saveConnectionCache.id} measurement names`)
                const measurement_names = await getMeasurementNames(saveConnectionCache.id);
                updateInfluxInstanceToCache({ id: saveConnectionCache.id, key: "selected_measurement", value: measurement_names[0] });
                updateInfluxInstanceToCache({ id: saveConnectionCache.id, key: "measurement_names", value: measurement_names })
            } else {
                errors.push("Database added but not online")
            }

            return { errors, databases };
        }

    } else {
        return { errors };
    }

}

async function deleteInfluxInstance(id) {
    let influx_instances = grabDataPoint(influx_instances_db);
    deleteDataPoint(influx_instances_db, { i: influx_instances[id].i })
    removeInstanceFromCache(id);
    await reflowDatabaseID();
}

async function reflowDatabaseID() {
    let influx_instances = cloneDeep(grabDataPoint(influx_instances_db));
    resetInfluxInstanceCache();
    for (let l = 0; l < influx_instances.length; l++) {
        await updateDataPoint(influx_instances_db, {i: influx_instances[l].i }, {i: l })
    }
    await influxInstanceConnect();
    return influx_instances;
}

async function testInstanceConnection(id) {
    let instanceCache = getInfluxInstanceCache(id)
    let connection;
    try {
        const ping = await instanceCache.instance.ping(1000)
        connection = ping[0].online;
    } catch (e) {
        connection = false;
    }
    return connection;
}
async function getInstanceDatabaseNames(id) {
    let instanceCache = getInfluxInstanceCache(id)
    let databaseNames = [];
    try {
        instanceCache.instance._options.database = instanceCache.selected_database;
        databaseNames = await instanceCache.instance.getDatabaseNames()
        return databaseNames;
    } catch (e) {
        return false;
    }
}

async function getMeasurementNames(id) {
     let instanceCache = getInfluxInstanceCache(id)
    let measurementNames = [];
    try {
        instanceCache.instance._options.database = instanceCache.selected_database;
        measurementNames = await instanceCache.instance.getMeasurements(instanceCache.selected_database);
        return measurementNames;
    } catch (e) {
        console.error(e)
        return false;
    }
}

async function createDatabase(instanceCache, databaseName) {
    await instanceCache.instance.createDatabase(databaseName);
}

function writePointsToDatebase({ instance, dataPoints, tags, measurementName }) {
    if (!dataPoints.timestamp) {
        return instance.writePoints([{
            measurement: measurementName,
            tags: tags,
            fields: dataPoints,
        },]);
    } else {
        return instance.writePoints([{
            measurement: measurementName,
            tags: tags,
            fields: dataPoints,
            timestamp: dataPoints.timestamp
        },], {
            precision: 'ms',
        });
    }
}

function queryDatabase(instanceCache, queryString) {
    return instanceCache.instance.query(queryString)
}

function changeDatabaseSelection(instanceCache, new_database) {
    instanceCache.selected_database = new_database;
    instanceCache.instance._options.database = new_database;
    updateInfluxInstanceToCache({ i:instanceCache.i, key: "selected_database", value: new_database })
    return instance;
}

function changeMeasurementSelection(instanceCache, new_measurement) {
    instanceCache.selected_measurement = new_measurement;
    updateInfluxInstanceToCache({ i:instanceCache.i, key: "selected_measurement", value: new_measurement })
    return instance;
}

module.exports = {
    influxInstanceConnect,
    addInfluxInstance,
    deleteInfluxInstance,
    createDatabase,
    testInstanceConnection,
    getInstanceDatabaseNames,
    writePointsToDatebase,
    queryDatabase,
    getMeasurementNames,
    changeMeasurementSelection,
    changeDatabaseSelection
}
