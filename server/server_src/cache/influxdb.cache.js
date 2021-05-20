let influx_connection_cache = [];

function addNewInfluxInstanceToCache({
    i = undefined,
    name = undefined,
    instance = undefined,
    status = undefined
}) {
    console.log(name, instance, i)
    if (!name || !instance || !i) {
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