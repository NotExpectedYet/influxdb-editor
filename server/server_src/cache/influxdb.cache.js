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
        name,
        instance: instance,
        status: status
    }
}


function getInfluxInstanceCache() {
    return influx_connection_cache;
}

module.exports = {
    addNewInfluxInstanceToCache,
    getInfluxInstanceCache
}
