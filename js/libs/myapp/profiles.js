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
    "./appdir",
    "./io"
], function(
        appdir, io
) {
    "use strict";

    var File = Packages.java.io.File;

    var defaultName = "default";
    var prdir = appdir + "work/profiles/";
    var idxpath = prdir + "_index.json";

    function checkUsername(username) {
        if ("string" !== typeof(username) ||
                0 === username.length ||
                !/^[a-zA-Z0-9]+$/.test(username)) {
            throw new Error("Invalid username specified: [" + username + "]");
        }
    }

    function updateIndex(activeName) {
        if (defaultName === activeName) {
            return;
        }
        var idx = {};
        if (new File(idxpath).exists()) {
            var idxstr = io.readFile(idxpath);
            idx = JSON.parse(idxstr);
        }
        idx.active = activeName;
        var updated = JSON.stringify(idx, null, 4);
        io.writeFile(idxpath, updated);
    }

    function save(username, profile) {
        checkUsername(username);
        if (!new File(prdir).exists()) {
            new File(prdir).mkdirs();
        }
        var path = prdir + username + ".json";
        var data = JSON.stringify(profile, null, 4);
        io.writeFile(path, data);
        updateIndex(username);
    }

    function saveDefault(profile) {
        save(defaultName, profile);
    }

    function load(username) {
        checkUsername(username);
        var path = prdir + username + ".json";
        if (new File(path).exists()) {
            var data = io.readFile(path);
            updateIndex(username);
            return JSON.parse(data);
        } else if (defaultName !== username){
            return load(defaultName);
        } else {
            throw new Error("Profile not found for username: [" + username + "]");
        }
    }

    function findActiveName() {
        if (new File(idxpath).exists()) {
            var idxstr = io.readFile(idxpath);
            var idx = JSON.parse(idxstr);
            return idx.active;
        } else {
            return null;
        }
    }

    function remove(username) {
        checkUsername(username);
        var path = prdir + username + ".json";
        new File(path).delete();
        var active = findActiveName();
        if (username === active) {
            new File(idxpath).delete();
        }
    }

    return {
        save: save,
        saveDefault: saveDefault,
        load: load,
        findActiveName: findActiveName,
        remove: remove
    };
});
