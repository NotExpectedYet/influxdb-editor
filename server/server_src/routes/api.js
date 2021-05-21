const express = require("express");
const path = require("path");

const router = express.Router();
// const { ensureAuthenticated } = require("../config/auth");
const { getInfluxInstanceCache } = require("../cache/influxdb.cache.js");
const { addInfluxInstance, testInstanceConnection, getInstanceDatabaseNames, deleteInfluxInstance } = require("../services/database/influxdb.database.js");
const { createInfluxURL } = require("../utils/influx.utils.js");

// influxDB
router.get("/instances", async (req, res) => {
    try {
        const instanceCache = await getInfluxInstanceCache();
        for (let i = 0; i < instanceCache.length; i++){
            instanceCache[i].status = await testInstanceConnection(instanceCache[i].instance);
            instanceCache[i].databases = await getInstanceDatabaseNames(instanceCache[i].instance)
            instanceCache[i].url = createInfluxURL(instanceCache[i].instance._options.hosts[0].protocol, instanceCache[i].instance._options.hosts[0].host, instanceCache[i].instance._options.hosts[0].port);
            instanceCache[i].password = instanceCache[i].instance._options.password;
            instanceCache[i].username = instanceCache[i].instance._options.username;
        }
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
    let i = req.params.index;
    try {
        await deleteInfluxInstance(i);
        res.send(true)
    } catch (e) {
        console.error(e.stack)
        res.sendStatus(500)
    }
});
router.put("/instances/:index", async (req, res) => {
    let i = req.params.index;
    let newData = req.body;
    try {
        await deleteInfluxInstance(i);
        await addInfluxInstance(newData);
        res.send(true)
    } catch (e) {
        console.error(e.stack)
        res.sendStatus(500)
    }
});



module.exports = router;
