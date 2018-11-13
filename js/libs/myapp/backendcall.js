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
    "./utils/formatError"
], function(formatError) {
    "use strict";

    function callRequireModule(cs) {
        // load module
        var module = null;
        // always sync on backend
        require([cs.module], function(mod) {
            module = mod;
        });
        // prepare args
        var args = "undefined" !== typeof (cs.args) ? cs.args : [];
        // perform call
        if ("string" === typeof(cs.func) && "" !== cs.func) {
            if ("function" !== typeof(module[cs.func])) {
                throw new Error("Invalid 'function' specified, name: [" + cs.func + "]");
            }
            // target call
            return module[cs.func].apply(module, args);
        } else if ("function" === typeof(module)) {
            // target call
            return module.apply(null, args);
        } else {
            throw new Error("Module is not callable, name: [" + cs.module + "]");
        }
    }

    return function(message) {
        var messageId = "unspecified";
        try {
            var msg = JSON.parse(message);
            if ("object" !== typeof(msg) || "string" !== typeof(msg.messageId)) {
                throw new Error("Invalid message received");
            }
            messageId = msg.messageId;
            if ("object" !== typeof(msg.payload) ||
                    "string" !== typeof(msg.payload.module)) {
                throw new Error("Invalid call description specified");
            }
            var res = callRequireModule(msg.payload);
            var response = {
                messageId: messageId,
                payload: res
            };
            return JSON.stringify(response, null, 4);
        } catch(e) {
            var errmsg = formatError(e, "Backend call error for message: [" + message +  "], ");
            var response = {
                messageId: messageId,
                error: errmsg
            };
            return JSON.stringify(response, null, 4);
        }
    };

});
