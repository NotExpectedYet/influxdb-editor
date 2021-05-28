let influx_connection_cache = new Array();

function addNewInfluxInstanceToCache({
    id = undefined,
    name = undefined,
    url = undefined,
    instance = undefined,
    status = undefined,
    username = undefined,
    password = undefined,
}) {

    if (!name || !instance) {
        throw new Error("No database has been specified!")
    }
    influx_connection_cache.splice(id, 0, {
        id,
        name,
        instance,
        url,
        status,
        username,
        password,
    });
}

function updateInfluxInstanceToCache({
    id = undefined,
    key = undefined,
    value = undefined
}) {
    influx_connection_cache[id][key] = value;
}

function removeInstanceFromCache(id = null) {
    if (id === null) {
        throw new Error("No index has been specified!")
    }
    influx_connection_cache.splice(id, 1)
    return;
}


function getInfluxInstanceCache(id = null) {
    if (id === null) {
        return influx_connection_cache;
    }
    return influx_connection_cache[id];
}

function resetInfluxInstanceCache() {
    return influx_connection_cache = new Array();
}

module.exports = {
    addNewInfluxInstanceToCache,
    removeInstanceFromCache,
    getInfluxInstanceCache,
    updateInfluxInstanceToCache,
    resetInfluxInstanceCache
}
