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
    "module",
    "myapp/common/store/dispatch",
    "myapp/components/header/Header",
    "text!./hello.html"
], function (module, dispatch, Header, template) {
    "use strict";

    return {
        template: template,

        components: {
            "myapp-header": new Header("Hello")
        },

        data: function() {
            return {
                module: module,

                menu: {
                    label: "Hello",
                    description: "Hello from MyApp",
                    path: "/hello"
                }
            };
        },

        methods: {
            sayHello: function() {
                dispatch("showMessage", "Hello from MyApp!");
            }
        }
    };
});
