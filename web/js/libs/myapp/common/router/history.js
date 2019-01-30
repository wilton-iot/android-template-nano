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
    "myapp/common/store/commitAsync"
], function(commitAsync) {
    "use strict";

    // manual history tracing is required to 
    // implement router.go(-1) in terms of router.push()
    // router.go(-1) causes glitches in WebView
    var history = [];
    var idx = -1;
 
    function canGoForward() {
        return (history.length - 1) > idx;
    }

    function canGoBack() {
        return idx > 0;
    }

    return {
        canGoForward: canGoForward,
        canGoBack: canGoBack,

        push: function(path) {
            if (canGoForward()) {
                history.splice(idx + 1, history.length - idx - 1);
                idx = history.length - 1;
            }
            if (history.length >= 1024) {
                history.splice(1, history.length - 1);
                idx -= 1;
            }
            if (path !== history[history.length - 1]) {
                history.push(path);
                idx += 1;
            }
        },

        pop: function() {
            if (history.length > 0) {
                var path = history.pop();
                idx -= 1;
                return path;
            }
            return null;
        },

        backPath: function() {
            if (canGoBack()) {
                idx -= 1;
                return history[idx];
            }
            return null;
        },

        forwardPath: function() {
            if (canGoForward()) {
                idx += 1;
                return history[idx];
            }
            return null;
        },

        current: function() {
            if (idx >= 0) {
                return history[idx];
            }
            return null;
        },

        updateState: function() {
            commitAsync("updateCanGoBack", canGoBack());
            commitAsync("updateCanGoForward", canGoForward());
        },

        dump: function() {
            return JSON.stringify({
                history: history,
                idx: idx,
                canGoForward: canGoForward()
            }, null, 4);
        }
    };
});
