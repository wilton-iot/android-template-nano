/* 
 * Copyright 2019, alex at staticlibs.net
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

define([
    "myapp/common/utils/checkProperties",
    "./activeSocket",
    "./backendcall",
    "./isAndroid",
    "./runOnRhinoThread",
    "json!./mimeTypes.json"
], function(
        checkProperties, activeSocket, backendcall, isAndroid, runOnRhinoThread, mimes
) {
    "use strict";

    var File = Packages.java.io.File;
    var FileInputStream = Packages.java.io.FileInputStream;
    var IHandler = Packages.org.nanohttpd.util.IHandler;
    var Method = Packages.org.nanohttpd.protocols.http.request.Method;
    var Response = Packages.org.nanohttpd.protocols.http.response.Response;
    var Status = Packages.org.nanohttpd.protocols.http.response.Status;
    var NanoWSD = Packages.org.nanohttpd.protocols.websockets.NanoWSD;
    var WebSocket = Packages.org.nanohttpd.protocols.websockets.WebSocket;

    var MIME_HTML = "text/html";
    var backslashRegex = new RegExp("/\\/g");

    function handleWebSocketRhino(req, socket) {
        runOnRhinoThread(function() {
            try {
                activeSocket.set(socket);
                var resp = backendcall(req);
                socket.send(resp);
            } finally {
                activeSocket.clear();
            }
        });
    }

    var websocket = {
        onOpen: function(adapter) {
            // no action
        },
        onClose: function(code, reason, initiatedByRemote, adapter) {
            // no action
        },
        onMessage: function(message, adapter) {
            var req = message.getTextPayload();
            var self = adapter || this;
            handleWebSocketRhino(req, self);
        },
        onPong: function(pong, adapter) {
            // no action
        },
        onException: function(exception, adapter) {
            // no action
        }
    };

    function createWebSocket(handshake) {
        if (isAndroid) {
            var WebSocketAdapter = Packages.myapp.android.support.nanohttpd.WebSocketAdapter;
            var WebSocketInterface = Packages.myapp.android.support.nanohttpd.WebSocketInterface;
            return new WebSocketAdapter(new WebSocketInterface(websocket), handshake);
        } else {
            return new JavaAdapter(WebSocket, websocket, handshake);
        }
    }

    var nanowsd = {
        serve: function(adapter) {
            throw new Error("Not used");
        },
        openWebSocket: function(handshake, adapter) {
            return createWebSocket(handshake);
        }
    };

    function createNanoWSD(hostname, port) {
        if (isAndroid) {
            var NanoWSDAdapter = Packages.myapp.android.support.nanohttpd.NanoWSDAdapter;
            var NanoWSDInterface = Packages.myapp.android.support.nanohttpd.NanoWSDInterface;
            return new NanoWSDAdapter(new NanoWSDInterface(nanowsd), hostname, port);
        } else {
            return new JavaAdapter(NanoWSD, nanowsd, hostname, port);
        }
    }

    function mimeType(path) {
        var idx = path.lastIndexOf(".");
        if (-1 === idx) {
            return "application/octet-stream";
        }
        var ext = path.substring(idx + 1).toLowerCase();
        var res = mimes[ext];
        if (!res) {
            return "application/octet-stream";
        }
        return res;
    }

    function serveFile(webDir, webPath, uri) {
        var uriForwardSlashes = uri.replace(backslashRegex, "/");
        var prefix = "/" + webPath + "/";
        if (0 !== uriForwardSlashes.indexOf(prefix)) {
            return Response.newFixedLengthResponse(Status.NOT_FOUND,
                MIME_HTML, "Not found, path: [" + uri + "]\n");
        }
        var uriNoPrefix = uriForwardSlashes.substring(prefix.length);
        if (-1 !== uriNoPrefix.indexOf("../")) {
            return Response.newFixedLengthResponse(Status.BAD_REQUEST,
                MIME_HTML, "Bad Request, path: [" + uri + "]\n");
        }
        var uriNoParams = uriNoPrefix;
        var qmarkIdx = uriForwardSlashes.indexOf('?');
        if (-1 !== qmarkIdx) {
            uriNoParams = uriNoPrefix.substring(0, qmarkIdx);
        }
        var path = webDir + "/" + uriNoParams;
        var file = new File(path);
        if (!(file.exists() && file.isFile())) {
            return Response.newFixedLengthResponse(Status.NOT_FOUND,
                MIME_HTML, "Not found, path: [" + uri + "]\n");
        }
        var fis = new FileInputStream(file);
        var len = file.length();
        var mime = mimeType(path);
        return Response.newFixedLengthResponse(Status.OK, mime, fis, len);
    }

    var Server = function(params) {
        checkProperties(params, ["hostname", "port", "webDir", "webPath"]);
        var handler = new IHandler({
            handle: function(session) {
                if (Method.GET.equals(session.getMethod())) {
                    try {
                        var resp = serveFile(params.webDir, params.webPath, String(session.getUri()));
                        resp.setUseGzip(false);
                        return resp;
                    } catch (e) {
                        var resp = Response.newFixedLengthResponse(Status.INTERNAL_ERROR,
                                MIME_HTML, e.message + "\n" + e.stack);
                        resp.setUseGzip(false);
                        return resp;
                    }
                } else {
                    var resp = Response.newFixedLengthResponse(Status.METHOD_NOT_ALLOWED,
                            MIME_HTML, Status.METHOD_NOT_ALLOWED.getDescription() + "\n");
                    resp.setUseGzip(false);
                    return resp;
                }
            }
        });
        this.server = createNanoWSD(params.hostname, params.port);
        this.server.setHTTPHandler(handler);
    };

    Server.prototype = {
        start: function() {
            this.server.start(0, true);
        },

        stop: function() {
            this.server.stop();
        }
    };

    return Server;
});
