/* 
 * Copyright 2018, alex at staticlibs.net
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
    "wsClient",
    "myapp/common/router/pushBack",
    "myapp/common/utils/isEmptyObject",
    "json!myapp/config.json"
], function(wsClient, pushBack, isEmptyObject, cf) {
    "use strict";

    var socket = null;

    function onError(obj) {
        if (cf.wsErrorsConsole) {
            var msg = obj;
            if ("object" === typeof(msg) &&
                    "undefined" !== msg.stack && "undefined" !== msg.message) {
                msg = formatError(msg);
            } else if (cf.wsConsoleStringify) {
                msg = JSON.stringify(obj, null, 4);
                if (isEmptyObject(JSON.parse(msg))) {
                    msg = String(obj);
                }
            }
            console.error(msg);
        }
    }

    function logger(obj) {
        if (cf.wsLogConsole) {
            var msg = obj;
            if (cf.wsConsoleStringify) {
                msg = JSON.stringify(obj, null, 4);
            }
            console.log(msg);
        }
    }

    return function(callDesc, cb) {
        if (null !== socket) {
            wsClient.send(socket, callDesc, cb);
        } else {
            // open and send
            wsClient.open(cf.wsUrl, {
                onError: onError,
                logger: logger
            }, function(err, openedSocket) {
                if (err) {
                   cb(err);
                } else {
                    socket = openedSocket;
                    // subscribe for back-pressed
                    wsClient.subscribe(socket, "back-pressed", pushBack);
                    // send
                    wsClient.send(socket, callDesc, cb);
                }
            });
        }
    };
});
