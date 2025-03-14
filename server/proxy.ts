#!/usr/bin/env node

// A WebSocket to TCP socket proxy
// Copyright 2012 Joel Martin
// Licensed under LGPL version 3 (see docs/LICENSE.LGPL-3)

// Known to work with node 0.8.9
// Requires node modules: ws and optimist
//     npm install ws optimist


const argv = require('optimist').argv
const net = require('net')
const http = require('http')
const url = require('url')
const path = require('path')
    fs = require('fs')
    mime = require('mime-types')

    Buffer = require('buffer').Buffer,
    WebSocketServer = require('ws').Server,

    wsServer,
    source_host, source_port, target_host, target_port,
    web_path = null;


// Handle new WebSocket client
const new_client = function(client, req) {
    var clientAddr = client._socket.remoteAddress, log;
    var start_time = new Date().getTime();

    console.log(req ? req.url : client.upgradeReq.url);
    log = function (msg) {
        console.log(' ' + clientAddr + ': '+ msg);
    };
    log('WebSocket connection');
    log('Version ' + client.protocolVersion + ', subprotocol: ' + client.protocol);

    if (argv.record) {
      var rs = fs.createWriteStream(argv.record + '/' + new Date().toISOString().replace(/:/g, "_"));
      rs.write('var VNC_frame_data = [\n');
    } else {
      var rs = null;
    }

    var target = net.createConnection(target_port,target_host, function() {
        log('connected to target');
    });
    target.on('data', function(data) {
        //log("sending message: " + data);

        if (rs) {
          var tdelta = Math.floor(new Date().getTime()) - start_time;
          var rsdata = '\'{' + tdelta + '{' + decodeBuffer(data) + '\',\n';
          rs.write(rsdata);
        }

        try {
            client.send(data);
        } catch(e) {
            log("Client closed, cleaning up target");
            target.end();
        }
    });
    target.on('end', function() {
        log('target disconnected');
        client.close();
        if (rs) {
          rs.end('\'EOF\'];\n');
        }
    });
    target.on('error', function() {
        log('target connection error');
        target.end();
        client.close();
        if (rs) {
          rs.end('\'EOF\'];\n');
        }
    });

    client.on('message', function(msg) {
        //log('got message: ' + msg);

        if (rs) {
          var rdelta = Math.floor(new Date().getTime()) - start_time;
          var rsdata = ('\'}' + rdelta + '}' + decodeBuffer(msg) + '\',\n');
          rs.write(rsdata);
        }

        target.write(msg);
    });
    client.on('close', function(code, reason) {
        log('WebSocket client disconnected: ' + code + ' [' + reason + ']');
        target.end();
    });
    client.on('error', function(a) {
        log('WebSocket client error: ' + a);
        target.end();
    });
};

function decodeBuffer(buf) {
  var returnString = '';
  for (var i = 0; i < buf.length; i++) {
    if (buf[i] >= 48 && buf[i] <= 90) {
      returnString += String.fromCharCode(buf[i]);
    } else if (buf[i] === 95) {
      returnString += String.fromCharCode(buf[i]);
    } else if (buf[i] >= 97 && buf[i] <= 122) {
      returnString += String.fromCharCode(buf[i]);
    } else {
      var charToConvert = buf[i].toString(16);
      if (charToConvert.length === 0) {
        returnString += '\\x00';
      } else if (charToConvert.length === 1) {
        returnString += '\\x0' + charToConvert;
      } else {
        returnString += '\\x' + charToConvert;
      }
    }
  }
  return returnString;
}

// Send an HTTP error response
http_error = function (response, code, msg) {
    response.writeHead(code, {"Content-Type": "text/plain"});
    response.write(msg + "\n");
    response.end();
    return;
}

// Process an HTTP static file request
const http_request = function (request, response) {
//    console.log("pathname: " + url.parse(req.url).pathname);
//    res.writeHead(200, {'Content-Type': 'text/plain'});
//    res.end('okay');

    if (! argv.web) {
        return http_error(response, 403, "403 Permission Denied");
    }

    var uri = url.parse(request.url).pathname
        , filename = path.join(argv.web, uri);

    fs.exists(filename, function(exists) {
        if(!exists) {
            return http_error(response, 404, "404 Not Found");
        }

        if (fs.statSync(filename).isDirectory()) {
            filename += '/index.html';
        }

        fs.readFile(filename, "binary", function(err, file) {
            if(err) {
                return http_error(response, 500, err);
            }

            var headers = {};
            var contentType = mime.contentType(path.extname(filename));
            if (contentType !== false) {
              headers['Content-Type'] = contentType;
            }

            response.writeHead(200, headers);
            response.write(file, "binary");
            response.end();
        });
    });
};

const webServer = http.createServer(http_request);

webServer.listen(source_port, function() {
    wsServer = new WebSocketServer({server: webServer});
    wsServer.on('connection', new_client);
});