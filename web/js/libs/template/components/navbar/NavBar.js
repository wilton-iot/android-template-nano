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
    // id
    "module",
    // common
    "template/common/router/push",
    "template/common/ui/highlight",
    "template/common/ui/image",
    "template/common/ui/ignoreNonTouch",
    // local
    "text!./NavBar.html"
], function(
        module, // id
        push, highlight, image, ignoreNonTouch,
        template
) {
    "use strict";

    return function() {
        this.template = template;

        this.data = function() {
            return {
                module: module,

                buttonCss: {
                    "template-img-inline-30": true,
                    "bg-primary": false
                },

                buttonSvg: "menu.svg"
            };
        },

        this.methods = {
            image: image,

            push: function(event, path) {
                console.log(event.type);
                if (ignoreNonTouch(event)) {
                    return;
                }
                var self = this;
                highlight(function() {
                    self.buttonCss["bg-primary"] = true;
                    self.buttonCss["text-light"] = true;
                    self.buttonSvg = "menu_white.svg";
                }, function() {
                    self.buttonCss["bg-primary"] = false;
                    self.buttonCss["text-light"] = false;
                    self.buttonSvg = "menu.svg";
                });
                push(path);
            }
        };
    };
});
