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
    "./utils/formatError",
    "./isAndroid"
], function(formatError, isAndroid) {
    "use strict";

    var executor = null;
    if (isAndroid) {
        var MainActivity = Packages.template.android.MainActivity;
        executor = MainActivity.RHINO_EXECUTOR;
    } else {
        var Thread = Packages.java.lang.Thread;
        var ThreadGroup = Packages.java.lang.ThreadGroup;
        var Executors = Packages.java.util.concurrent.Executors;
        executor = Executors.newFixedThreadPool(1, function(runnable) {
            var thread = new Thread(new ThreadGroup("rhino"), runnable, "rhino-thread");
            thread.setDaemon(true);
            return thread;
        });
    }

    return function(fun) {
        executor.execute(function() {
            try {
                fun();
            } catch(e) {
                var err = formatError(e, "Rhino thread: ");
                print(err);
            }
        });
    };
});

