const express = require("express");
const path = require("path");

const router = express.Router();
// const { ensureAuthenticated } = require("../config/auth");
const { getInfluxInstanceCache } = require("../cache/influxdb.cache.js");
const { queryDatabase } = require("../services/database/influxdb.database.js");
const { createInfluxURL } = require("../utils/influx.utils.js");

// influxDB
router.get("/databases/:id/:name/:limit", async (req, res) => {
    let database_name = req.params.name;
    let record_limit = req.params.limit;
    let database_id = req.params.id;
    let databaseCache = getInfluxInstanceCache(database_id);
    databaseCache.instance._options.database = database_name;
     try {
        const currentRecords = await queryDatabase(databaseCache.instance,`
        SELECT * FROM "${database_name}"
        ORDER BY DESC
        limit ${record_limit}
        `)
        console.log(currentRecords)
        res.send(currentRecords)
    } catch (e) {
        console.error(e.stack)
        res.sendStatus(500)
    }
});
router.post("/databases", async (req, res) => {
     let data = req.body;
    try {
    
    } catch (e) {
        console.error(e.stack)
        res.sendStatus(500)
    }
});
router.delete("/databases/:index", async (req, res) => {
    let i = req.params.index;
    try {

    } catch (e) {
        console.error(e.stack)
        res.sendStatus(500)
    }
});
router.put("/databases/:index", async (req, res) => {
    let i = req.params.index;
    let newData = req.body;
    try {
    
        res.send(true)
    } catch (e) {
        console.error(e.stack)
        res.sendStatus(500)
    }
});



module.exports = router;
