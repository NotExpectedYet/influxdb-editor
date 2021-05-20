const express = require("express");
const path = require("path");

const router = express.Router();
// const { ensureAuthenticated } = require("../config/auth");
const { getInfluxInstanceCache } = require("../cache/influxdb.cache.js");
const { addInfluxInstance, testInstanceConnection, getInstanceDatabaseNames } = require("../services/database/influxdb.database.js");

// influxDB
router.get("/instances", async (req, res) => {
    try {
        const instanceCache = getInfluxInstanceCache();
        for(let i = 0; instanceCache.length; i++){
            const db = instanceCache[i]
            instanceCache[i].status = await testInstanceConnection(db.instance);
            instanceCache[i].databases = await getInstanceDatabaseNames(db.instance)
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



module.exports = router;
