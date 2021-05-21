let influx_connection_cache = [];

function addNewInfluxInstanceToCache({
    i = undefined,
    name = undefined,
    instance = undefined,
    status = undefined
}) {

    if (!name || !instance) {
        throw new Error("No database has been specified!")
    }

    influx_connection_cache[i] = {
        i,
        name,
        instance: instance,
        status: status
    }

}
function removeInstanceFromCache(i = undefined) {

    if (!i) {
        throw new Error("No index has been specified!")
    }

    influx_connection_cache.splice(i, 1)

}


async function getInfluxInstanceCache() {
    return influx_connection_cache;
}

module.exports = {
    addNewInfluxInstanceToCache,
    removeInstanceFromCache,
    getInfluxInstanceCache
}
