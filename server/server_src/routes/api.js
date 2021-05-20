const express = require("express");
const path = require("path");

const router = express.Router();
// const { ensureAuthenticated } = require("../config/auth");
const { getInfluxInstanceCache } = require("../cache/influxdb.cache.js");
const { addInfluxInstance } = require("../services/database/influxdb.database.js");

// influxDB
router.get("/instances", (req, res) => {
    try {
        const databaseCache = getInfluxInstanceCache();
        res.send(databaseCache)
    } catch (e) {
        console.error(e.stack)
        res.sendStatus(500)
    }
});
router.post("/instances", async (req, res) => {
     let data = req.body;
    try {
        addDatabase = await addInfluxInstance(data);
        res.send(addDatabase)
    } catch (e) {
        console.error(e.stack)
        res.sendStatus(500)
    }
});



module.exports = router;