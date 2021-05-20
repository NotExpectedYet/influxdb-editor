const Influx = require("influx");
const { findIndex } = require("lodash")

const { influx_instances_db, grabDataPoint, writeDataPoint } = require("./lowdb.database.js");
const { addNewInfluxInstanceToCache } = require("../../cache/influxdb.cache.js");

function influxInstanceConnect() {
    // const currentInfluxInstanceList = grabDataPoint(influx_instances_db);

    // for (let i = 0; i < currentInfluxInstanceList.length; i++) {
    //     const cd = currentInfluxInstanceList[i];

    //     addNewInfluxInstanceToCache({ name: cd.name, database: cd.databaseConnection });
    // }

}
async function addInfluxInstance({ url = undefined, name = undefined, username = undefined, password = undefined }) {
    let errors = [];

    if (!url.includes("http")) {
        errors.push("Invalid URL!")
    }

    let options = {
        username: username,
        password: password,
        host: "10.50.0.15",
        port: 8086,
    }

    if (!errors.length > 0) {
        const parsed_url = new URL(url)

        // // Strip out http / https
        if (parsed_url.protocol === "http:") {
            options.protocol = "http"
            options.port = 80;
        } else if (parsed_url.protocol === "https:") {
            options.protocol = "https",
                options.port = 443
        }

        if (!parsed_url.port === "") {
            options.port = parseInt(parsed_url.port);
        }
        
        options.host = parsed_url.host;

        const new_instance = new Influx.InfluxDB(options);
        let databaseList;
        try {
            databaseList = await new_instance.getDatabaseNames()
        } catch (e) {
            errors.push("Unable to contact database...")
            return { errors }
        }

        const currentInfluxInstanceList = grabDataPoint(influx_instances_db);
        const instanceIndex = currentInfluxInstanceList.length + 1;

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
        console.log(database_index)
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
    writePointsToDatebase,
    queryDatabase
}