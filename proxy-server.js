'use strict';

let port = 5050;
let apiForwardingUrl = 'http://localhost:8080';
let enable_cors = false;

if (process.argv.length < 5) {
    console.error('Parameters required: <proxy-port> <apiForwardingUrl> <enable-cors>');
    process.exit();
}

if (process.argv[2]) {
    port = parseInt(process.argv[2], 10);
}

if (process.argv[3]) {
    apiForwardingUrl = process.argv[3];
}

if (process.argv[4]) {
    enable_cors = (process.argv[4] === 'true');
}

const express = require('express');
const httpProxy = require('http-proxy');
const btoa = require('btoa');
const prompt = require('prompt');

let getHeader = function (username, password) {
    if (!username || !password) {
        return undefined;
    }
    let str = username + ':' + password;
    let base64 = btoa(str);
    return 'Basic ' + base64;
};

let schema = {
    properties: {
        unummer: {
            message: 'U-Nummer', required: false, default: process.env.USERNAME
        }, password: {
            message: 'Passwort', hidden: true, required: false
        }
    }
};

let startServer = function (header) {
    const server = express();
    server.set('port', port);

    const proxyOptions = {
        changeOrigin: true, secure: false
    };

    httpProxy.prototype.onError = function (err) {
        console.error(err);
    };

    const apiProxy = httpProxy.createProxyServer(proxyOptions);

    console.log(`Forwarding API requests from localhost:${port} to ${apiForwardingUrl}`);

    if (enable_cors) {
        server.use(function(req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        });
    }

    server.all("/*", function (req, res) {
        console.log(`${req.method} Request to ${req.originalUrl}`);
        req.headers['Authorization'] = header;
        apiProxy.web(req, res, {target: apiForwardingUrl});
    });

    server.listen(server.get('port'), function () {
        console.log('Express server listening on port ' + server.get('port'));
    });
};

console.log('Leave username and password empty to disable auth header');
prompt.start();

prompt.get(schema, function (err, result) {
    let header = getHeader(result.unummer, result.password);
    if (!header) {
        console.log('No U-Nummer / Password set. Don\'t apply auth header');
    }
    startServer(header);
});
