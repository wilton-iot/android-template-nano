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
    "myapp/common/store/commit",
    // components
    "myapp/components/header/Header",
    "myapp/components/list/List",
    // modules
    "myapp/modules/exit/exit",
    "myapp/modules/hello/hello",
    // other
    "text!./menu.html"
], function (
        module, // id
        commit, // common
        Header, List, // components
        exit, hello,// modules
        template // other
) {
    "use strict";

    function modsListItems(mods) {
        var res = [];
        for (var i = 0; i < mods.length; i++) {
            res.push(mods[i].data().listItem);
        }
        return res;
    }

    return {
        template: template,

        components: {
            "myapp-header": new Header("Menu", "Choose a section of MyApp application from a list below"),
            "myapp-list": new List(modsListItems([
                hello,
                exit
            ]))
        },

        created: function() {
            commit("updateCanGoToMenu", false);
        },

        destroyed: function() {
            commit("updateCanGoToMenu", true);
        },

        data: function() {
            return {
                module: module
            };
        }
    };
});
