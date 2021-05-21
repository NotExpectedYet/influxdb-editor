let influx_connection_cache = new Array();

function addNewInfluxInstanceToCache({
    i = undefined,
    name = undefined,
    instance = undefined,
    status = undefined
}) {

    if (!name || !instance) {
        throw new Error("No database has been specified!")
    }

    influx_connection_cache.splice(i, 0, {
        i,
        name,
        instance: instance,
        status: status
    });

}
function removeInstanceFromCache(i = undefined) {

    if (!i) {
        throw new Error("No index has been specified!")
    }

    influx_connection_cache.splice(i, 1)

}


function getInfluxInstanceCache(i = undefined) {
    if (!i) {
        return influx_connection_cache;
    }
    return influx_connection_cache[i];
}

module.exports = {
    addNewInfluxInstanceToCache,
    removeInstanceFromCache,
    getInfluxInstanceCache
}
