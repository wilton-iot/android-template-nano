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
    "template/common/store/commit",
    "template/common/store/state",
    "template/common/ui/highlight",
    "template/common/ui/ignoreNonTouch",
    "template/common/ui/image",
    // components
    "template/components/header/Header",
    // entries
    "template/modules/hello/hello",
    "template/modules/exit/exit",
    // other
    "text!./menu.html"
], function (
        module, // id
        push, commit, state, highlight, ignoreNonTouch, image, // common
        Header, // components
        hello, exit, // lessons
        template // other
    ) {
    "use strict";

    var entryModules = [
        hello,
        exit
    ];

    function entryRowCss() {
        return {
            "row": true,
            "pt-2": true,
            "bg-primary": false
        };
    }

    function entryLabelCss() {
        return {
            "text-primary": true,
            "border-bottom": true,
            "h4": true,
            "font-weight-bold": false,
            "text-light": false
        };
    }

    function entryDescriptionCss() {
        return {
            "col": true,
            "text-muted": true,
            "text-light": false
        };
    }

    function createEntries() {
        var res = [];
        for (var i = 0; i < entryModules.length; i++) {
            var mod = entryModules[i];
            var en = mod.data().menu;
            en.rowCss = entryRowCss();
            en.labelCss = entryLabelCss();
            en.descriptionCss = entryDescriptionCss();
            en.arrowSvg = "list-arrow.svg";
            res.push(en);
        }
        return res;
    }

    return {
        template: template,

        components: {
            "template-header": new Header("Menu")
        },

        created: function() {
            var list = this.entries;
            var lp = state(this).lastPath;
            for (var i = 0; i < list.length; i++) {
                var en = list[i];
                if (lp === en.path) {
                    en.labelCss["font-weight-bold"] = true;
                }
            }
        },

        data: function() {
            return {
                module: module,

                entries: createEntries(this)
            };
        },

        methods: {
            image: image,

            pushEntry: function(event, en) {
                if (ignoreNonTouch(event)) {
                    return;
                }
                highlight(function() {
                    en.rowCss["bg-primary"] = true;
                    en.labelCss["text-light"] = true;
                    en.descriptionCss["text-muted"] = false;
                    en.descriptionCss["text-light"] = true;
                    en.arrowSvg = "list-arrow_white.svg";
                }, function() {
                    en.rowCss["bg-primary"] = false;
                    en.labelCss["text-light"] = false;
                    en.descriptionCss["text-muted"] = true;
                    en.descriptionCss["text-light"] = false;
                    en.arrowSvg = "list-arrow_white.svg";
                });
                commit(this, "menu/updateLastPath", en.path);
                push(en.path);
            }
        }
    };
});
