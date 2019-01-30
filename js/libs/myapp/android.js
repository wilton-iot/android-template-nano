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
    "myapp/common/utils/formatError",
    "./activeSocket",
    "./appdir",
    "./Server"
], function(formatError, activeSocket, appdir, Server) {
    "use strict";

    var Runnable = Packages.java.lang.Runnable;
    var Process = Packages.android.os.Process;
    var Log = Packages.android.util.Log;
    var View = Packages.android.view.View;
    var WebViewClient = Packages.android.webkit.WebViewClient;

    var MainActivity = Packages.myapp.android.MainActivity;
    var R = Packages.myapp.android.R;

    var mainActivity = MainActivity.INSTANCE;

    function runOnUiThread(fun) {
        mainActivity.runOnUiThread(function() {
            try {
                fun();
            } catch(e) {
                var err = formatError(e);
                Log.e("myapp.android", err);
                mainActivity.showMessage(err);
            }
        });
    }

    function hideSplash() {
        runOnUiThread(function() {
            var splash = mainActivity.findViewById(R.id.loading_splash);
            splash.setVisibility(View.GONE);
        });
    }

    function initWebView() {
        runOnUiThread(function() {
            // init webview
            var webView = mainActivity.findViewById(R.id.activity_main_webview);
            // Force links and redirects to open in the WebView instead of in a browser
            webView.setWebViewClient(new WebViewClient());
            webView.getSettings().setJavaScriptEnabled(true);
            webView.loadUrl("http://127.0.0.1:8080/web/index.html");
        });
    }

    function startServer() {
        var server = new Server({
            hostname: "127.0.0.1",
            port: 8080,
            webDir: appdir + "web",
            webPath: "web"
        });
        server.start();
    }

    function initialize() {
        startServer();
        hideSplash();
        initWebView();
    }

    function killCurrentProcess() {
        var pid = Process.myPid();
        Process.killProcess(pid);
    }

    function showMessage(msg) {
        mainActivity.showMessage(msg);
    }

    function activateBackPressedNotifications(topic) {
        if (null !== mainActivity.backPressedCallback) {
            throw new Error("OnBackPressed notifications already activated");
        }
        if ("string" !== typeof(topic) || 0 === topic.length) {
            throw new Error("Invalid empty topic specified");
        }
        var socket = activeSocket.get();
        mainActivity.backPressedCallback = new Runnable(function() {
            var msg = JSON.stringify({
                broadcast: topic
            }, null, 4);
            socket.send(msg);
        });
    }

    return {
        initialize: initialize,
        killCurrentProcess: killCurrentProcess,
        showMessage: showMessage,
        activateBackPressedNotifications: activateBackPressedNotifications
    };
});
