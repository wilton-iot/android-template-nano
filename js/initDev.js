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

(function(){
    // get app directory
    var appdir = function() {
        var clazz = Packages.java.lang.Class.forName("org.mozilla.javascript.tools.shell.Main");
        var uri = clazz.getProtectionDomain().getCodeSource().getLocation().toURI();
        var file = new Packages.java.io.File(uri);
        var badslashPath = String(file.getParentFile().getParentFile().getAbsolutePath());
        return badslashPath.replace(/\\/g, "/");
    } ();

    load(appdir  + "/js/requireConfig.js");
    requireConfig(appdir);

    // get module name and args
    var argline = String(arguments[0]).trim();
    var input = function() {
        if (-1 !== argline.indexOf(" ")) {
            var splitted = argline.split(" ");
            var module = splitted[0];
            splitted.shift();
            return {
                module: module,
                args: splitted
            };
        } else {
            return {
                module: argline,
                args: []
            };
        }
    } ();

    // load and run specified module
    require([input.module], function(mod) {
        if ("function" === typeof(mod.main)) {
            mod.main.apply(mod, input.args);
        } else {
            Packages.java.lang.System.out.println(
                    "ERROR: 'main' entry not found," +
                    " module: [" + input.module + "]");
        }
    });

} (arguments));
