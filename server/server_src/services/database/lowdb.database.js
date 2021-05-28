const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')


const adapter = new FileSync('db.json')
const db = low(adapter)

const user_db = "users";
const influx_instances_db = "influx_instances";



function lowdbDatabaseSetup() {
    // Initialise the user database
    db.defaults({ [user_db]: [], [influx_instances_db]: [] })
        .write()
}

function writeDataPoint(database, object) {
    db.get(database)
        .push(object)
        .write()
}

function updateDataPoint(database, findObject, updateObject) {
    return db.get(database)
            .find(findObject)
            .assign(updateObject)
            .write()
}

function grabDataPoint(database) {
    return db.get(database)
        .value()
}

function deleteDataPoint(database, object) {
    db.get(database)
        .remove(object)
        .write()
}

function setDataPointToZero(database) {
    db.set(database, [])
        .write()
}

module.exports = {
    user_db,
    influx_instances_db,
    lowdbDatabaseSetup,
    writeDataPoint,
    grabDataPoint,
    deleteDataPoint,
    setDataPointToZero,
    updateDataPoint
}