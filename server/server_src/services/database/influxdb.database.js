const Influx = require("influx");
const { findIndex } = require("lodash")

const { influx_instances_db, grabDataPoint, writeDataPoint } = require("./lowdb.database.js");
const { addNewInfluxInstanceToCache } = require("../../cache/influxdb.cache.js");
const { createInfluxOptions } = require("../../utils/influx.utils.js");

async function influxInstanceConnect() {
    const currentInfluxInstanceList = grabDataPoint(influx_instances_db);
    for (let i = 0; i < currentInfluxInstanceList.length; i++) {
        const cd = currentInfluxInstanceList[i];

        const options = createInfluxOptions(`${cd.protocol}://${cd.host}:${cd.port}`, cd.username, cd.password);

        const new_instance = new Influx.InfluxDB(options);

        const saveConnectionCache = {
            i: cd.i,
            name: cd.name,
            instance: new_instance,
            status: true
        }

        saveConnectionCache.status = await testInstanceConnection(new_instance)

        addNewInfluxInstanceToCache(saveConnectionCache);
    }

}
async function addInfluxInstance({ url = undefined, name = undefined, username = undefined, password = undefined }) {
    let errors = [];

    if (!url.includes("http")) {
        errors.push("Invalid URL!")
        return [ errors ]
    }

    if (!errors.length > 0) {


        const new_instance = new Influx.InfluxDB(options);
        let databaseList;
        try {
            databaseList = await new_instance.getDatabaseNames()
        } catch (e) {
            errors.push("Unable to contact database...")
            return { errors }
        }

        const options = createInfluxOptions(url, username, password);

        const currentInfluxInstanceList = grabDataPoint(influx_instances_db);

        let instanceIndex = currentInfluxInstanceList.length
        if(instanceIndex !== 0){
            instanceIndex = currentInfluxInstanceList.length + 1;
        }


        const saveConnectionCache = {
            i: instanceIndex,
            name: name,
            instance: new_instance,
            status: true
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

            return { errors, databaseList };
        }

    } else {
        return { errors };
    }

}

async function testInstanceConnection(instance){
    let connection;
    try {
        await instance.getDatabaseNames()
        connection = true;
    } catch (e) {
        connection = false;
    }
    return connection;
}
async function getInstanceDatabaseNames(instance){
    let databaseNames;
    try {
        databaseNames = await instance.getDatabaseNames()
    } catch (e) {
        databaseNames = [];
    }
    return databaseNames;
}

async function createDatabase(options) {
    const names = await db.getDatabaseNames();
    await db.createDatabase(options.database);
}

function writePointsToDatebase(dataPoints) {
    if (!dataPoints.timestamp) {
        return db.writePoints([{
            measurement: "qc_record",
            tags: tags,
            fields: dataPoints,
        },]);
    } else {
        return db.writePoints([{
            measurement: "qc_record",
            tags: tags,
            fields: dataPoints,
            timestamp: dataPoints.timestamp
        },], {
            precision: 'ms',
        });
    }
}

async function queryDatabase(queryString) {
    return db.query(queryString)
}


module.exports = {
    influxInstanceConnect,
    addInfluxInstance,
    createDatabase,
    testInstanceConnection,
    getInstanceDatabaseNames,
    writePointsToDatebase,
    queryDatabase
}
