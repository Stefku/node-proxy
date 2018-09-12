# Node Proxy Server

A proxy server based on node express. 

## Basic Auth Header
This application asks on command line for username and password and creates a proxy server, that appends authorization
header to all requests. Leave username and password empty to do not apply auth header.

## CORS
It's also possible to enable CORS by adding HTTP Headers like ```Access-Control-Allow-Origin```. 

## Usage
1. ```npm install```
1. ```node proxy-server.js  <proxy-port> <apiForwardingUrl> <enableCors>```

## Example
Start a proxy on localhost port 5001 without cors and delegate to http://example.com

```node proxy-server.js 5001 http://example.com false```