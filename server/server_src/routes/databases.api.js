const express = require("express");
const path = require("path");
const { startCase } = require("lodash")

const router = express.Router();
// const { ensureAuthenticated } = require("../config/auth");
const { getInfluxInstanceCache, updateInfluxInstanceToCache } = require("../cache/influxdb.cache.js");
const { queryDatabase } = require("../services/database/influxdb.database.js");

// influxDB
router.get("/databases/:instance_id/:database_name/:measurement_name/:limit", async (req, res) => {
    let database_name = req.params.database_name;
    let measurement_name = req.params.measurement_name;
    let record_limit = req.params.limit;
    let database_id = req.params.instance_id;

    let databaseCache = getInfluxInstanceCache(database_id);
    databaseCache.instance._options.database = database_name;
     try {
        const currentRecords = await queryDatabase(databaseCache,`
        SELECT * FROM "${measurement_name}"
        ORDER BY DESC
        limit ${record_limit}
        `)
         const tableKeys = Object.keys(currentRecords[0])
         let tableHeaders = []
         tableKeys.forEach(key => {
             tableHeaders.push({
                 text: startCase(key),
                 value: key
             })
         })
         tableHeaders.push({ text: 'Actions', value: 'actions', sortable: false },)
         let tableData = currentRecords.groupRows[0].rows;
         updateInfluxInstanceToCache({id: databaseCache.id, key: "selected_measurement", value: measurement_name });
         res.send({tableHeaders, tableData})
    } catch (e) {
        console.error(e.stack)
        res.sendStatus(500)
    }
});
router.post("/databases/:instance_id/:database_name/:measurement_name/:time", async (req, res) => {
    let database_name = req.data.database_name;
    let measurement_name = req.data.measurement_name;
    let record_limit = req.data.limit;
    let database_id = req.data.instance_id;
    try {
    
    } catch (e) {
        console.error(e.stack)
        res.sendStatus(500)
    }
});
router.delete("/databases/:instance_id/:database_name/:measurement_name/:time", async (req, res) => {
    let database_name = req.params.database_name;
    let measurement_name = req.params.measurement_name;
    let database_id = req.params.instance_id;
    let time = req.params.time;
    const time_b = new Date(time);
    const time_a = new Date(time);
    let time_before = time_b.setTime(time_b.getTime() - (1000));
    let time_after = time_a.setTime(time_a.getTime() + (1000));
    time_before = new Date(time_before);
    time_after = new Date(time_after);
    time_before = time_before.toISOString()
    time_after = time_after.toISOString()

    let databaseCache = getInfluxInstanceCache(database_id);
    databaseCache.instance._options.database = database_name;

    try {
        const currentRecords = await queryDatabase(`
        DELETE FROM "${measurement_name}" WHERE time > '${time_before}' and time < '${time_after}'
        `)
        res.sendStatus(200);
    } catch (e) {
        console.error(e.stack)
        res.sendStatus(500)
    }
});
router.put("/databases/:instance_id/:database_name/:measurement_name", async (req, res) => {
    let database_name = req.params.database_name;
    let measurement_name = req.params.measurement_name;
    let record_limit = req.params.limit;
    let database_id = req.params.instance_id;
    let newData = req.body;
    try {
    
        res.send(true)
    } catch (e) {
        console.error(e.stack)
        res.sendStatus(500)
    }
});



module.exports = router;
