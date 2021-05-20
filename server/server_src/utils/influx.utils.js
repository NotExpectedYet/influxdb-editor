function createInfluxOptions(url = undefined, username = undefined, password = undefined) {
    if(!url){
        throw new Error("No URL provided!")
    }
    let options = {
        username: username,
        password: password,
        host: "10.50.0.15",
        port: 8086,
    }
    const parsed_url = new URL(url)

    // // Strip out http / https
    if (parsed_url.protocol === "http:") {
        options.protocol = "http";
        options.port = 80;
    } else if (parsed_url.protocol === "https:") {
        options.protocol = "https";
        options.port = 443
    }

    if (parsed_url.port !== "") {
        options.port = parseInt(parsed_url.port);
    }

    options.host = parsed_url.hostname;

    return options;
}

module.exports = {
    createInfluxOptions
}
