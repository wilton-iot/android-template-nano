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
    "./assert",
    "../backendcall"
], function(assert, backendcall) {
    "use strict";

    print("test: backendcall");

    function comparePayload(callDesc, expected, checkError) {
        var respJson = backendcall(JSON.stringify({
            messageId: "foo",
            payload: callDesc
        }, null, 4));
        var resp = JSON.parse(respJson);
        assert.equal(resp.messageId, "foo");
        if (checkError) {
            assert("string" === typeof(resp.error));
        } else {
            assert.equal(resp.payload, expected);
        }
    }

    comparePayload({
        module: "template/test/support/modobj",
        func: "test",
        args: ["foo"]
    }, "foobar");

    comparePayload({
        module: "template/test/support/modfun",
        args: ["foo"]
    }, "foobar");

    comparePayload({
        module: "template/test/support/modnone"
    }, null, true);

});
