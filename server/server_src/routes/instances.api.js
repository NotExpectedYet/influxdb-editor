const express = require("express");
const path = require("path");

const router = express.Router();
// const { ensureAuthenticated } = require("../config/auth");
const { getInfluxInstanceCache, updateInfluxInstanceToCache, resetInfluxInstanceCache } = require("../cache/influxdb.cache.js");
const { addInfluxInstance, testInstanceConnection, getInstanceDatabaseNames, deleteInfluxInstance, getMeasurementNames } = require("../services/database/influxdb.database.js");
const { createInfluxURL } = require("../utils/influx.utils.js");

router.get("/instances/refresh/:id", async (req, res) => {
    let id = req.params.id;
    try {
        const instanceCache = await getInfluxInstanceCache(id);
        instanceCache.status = await testInstanceConnection(instanceCache.id);
        if (instanceCache.status) {
            instanceCache.databases = await getInstanceDatabaseNames(instanceCache.id);
            updateInfluxInstanceToCache({id: instanceCache.id, key: "databases", value: instanceCache.databases });
            updateInfluxInstanceToCache({id: instanceCache.id, key: "selected_database", value: instanceCache.databases[0] });
            instanceCache.measurement_names = await getMeasurementNames(instanceCache.id)
            updateInfluxInstanceToCache({id: instanceCache.id, key: "measurement_names", value: instanceCache.measurement_names });
            updateInfluxInstanceToCache({id: instanceCache.id, key: "selected_measurement", value: instanceCache.measurement_names[0] });
        }
        res.send(instanceCache)
    } catch (e) {
        console.error(e.stack)
        res.sendStatus(500)
    }
});


// influxDB
router.get("/instances", (req, res) => {
    try {
        const instanceCache = getInfluxInstanceCache();
        res.send(instanceCache)
    } catch (e) {
        console.error(e.stack)
        res.sendStatus(500)
    }
});

router.post("/instances", async (req, res) => {
     let data = req.body;
    try {
        const addDatabase = await addInfluxInstance(data);
        res.send(addDatabase)
    } catch (e) {
        console.error(e.stack)
        res.sendStatus(500)
    }
});
router.delete("/instances/:index", async (req, res) => {
    let id = req.params.index;
    try {
        await deleteInfluxInstance(id);
        res.send(true)
    } catch (e) {
        console.error(e.stack)
        res.sendStatus(500)
    }
});
router.put("/instances/:index", async (req, res) => {
    // let id = req.params.index;
    // let newData = req.body;
    // const instanceCache = getInfluxInstanceCache();
    // try {
    //         await resetInfluxInstanceCache();
    //         await updateDataPoint(influx_instances_db, instanceCache[id], newData)
    //         await influxInstanceConnect();
    //     res.send(true)
    // } catch (e) {
    //     console.error(e.stack)
    //     res.sendStatus(500)
    // }
});

router.get("/instances/:id/:database", async (req, res) => {
    let id = req.params.id;
    let database_name = req.params.database;
    try {
        const instanceCache = await getInfluxInstanceCache(id);
        instanceCache.status = await testInstanceConnection(instanceCache.id);

        if (instanceCache.status) {
            let database;
            if (database_name === "null") {
                database = instanceCache.selected_database;
            } else {
                database = req.params.database;
            }
            instanceCache.databases = await getInstanceDatabaseNames(instanceCache.id);
            updateInfluxInstanceToCache({id: instanceCache.id, key: "databases", value: instanceCache.databases });
            updateInfluxInstanceToCache({id: instanceCache.id, key: "selected_database", value: database });
            instanceCache.measurement_names = await getMeasurementNames(instanceCache.id)
            updateInfluxInstanceToCache({id: instanceCache.id, key: "measurement_names", value: instanceCache.measurement_names });
            updateInfluxInstanceToCache({id: instanceCache.id, key: "selected_measurement", value: instanceCache.measurement_names[0] });
        }
        res.send(instanceCache)
    } catch (e) {
        console.log(e)
        console.error(e.stack)
        res.sendStatus(500)
    }
});


module.exports = router;