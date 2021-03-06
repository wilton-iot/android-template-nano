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
    "myapp/appdir",
    "myapp/Server"
], function(appdir, Server) {
    "use strict";

    var System = Packages.java.lang.System;

    return {
        main: function() {
            var server = new Server({
                hostname: "127.0.0.1",
                port: 8080,
                webDir: appdir + "web",
                webPath: "web"
            });
            print("Starting server ...");
            server.start();
            print("Server started, url: [http://127.0.0.1:8080/web/index.html], press 'Enter' to stop");
            System.console().readLine();
            print("Shutting down server ...");
            server.stop();
            print("Server shut down");
        }
    };
});
