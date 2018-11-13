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

requireConfig = function(appdir) {
    // load RequireJS library
    load(appdir  + "/js/compat.js");
    load(appdir  + "/web/js/require.js");

    // allow RequireJS to load scripts through Rhino
    // see: https://github.com/requirejs/r.js/blob/27594a409b3d37427ec33bdc151ae8a9f67d6b2b/build/jslib/rhino.js
    require.load = function(context, moduleName, url) {
        load(url);
        //Support anonymous modules.
        context.completeLoad(moduleName);
    };

    // apply RequireJS config
    requirejs.config({
        waitSeconds: 0,
        enforceDefine: true,
        nodeIdCompat: true,
        baseUrl: appdir  + "/js/libs",
        paths: {
            json: appdir  + "/web/js/libs/json",
            text: appdir  + "/web/js/libs/text",
            "myapp/common/utils": appdir + "/web/js/libs/myapp/common/utils" 
        }
    });

    // cleanup itself from global scope
    delete requireConfig;
};
