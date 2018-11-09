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

package template.android;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.content.res.AssetManager;
import android.os.*;
import android.util.Log;
import android.webkit.WebView;

import org.mozilla.javascript.Context;
import org.mozilla.javascript.ContextFactory;
import org.mozilla.javascript.Function;
import org.mozilla.javascript.FunctionObject;
import org.mozilla.javascript.Script;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;

import java.io.Closeable;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.Reader;
import java.lang.reflect.Method;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadFactory;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipEntry;

public class MainActivity extends Activity {

    private static Context RHINO_CONTEXT;
    private static ScriptableObject RHINO_SCOPE;

    public static Executor RHINO_EXECUTOR =
            Executors.newSingleThreadExecutor(new RhinoThreadFactory());

    // launchMode="singleInstance" is used
    public static MainActivity INSTANCE = null;

    // Activity callbacks

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        if (null == INSTANCE) {
            INSTANCE = this;
        }
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        if (null == RHINO_CONTEXT && null == RHINO_SCOPE) {
            RHINO_EXECUTOR.execute(new Runnable() {
                @Override
                public void run() {
                    try {
                        startApplication();
                    } catch (Throwable e) {
                        showError(e);
                    }
                }
            });
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        // hideBottomBar();
    }

    @Override
    public void onNewIntent(Intent newIntent) {
        this.setIntent(newIntent);
    }

    @Override
    public void onBackPressed() {
        WebView wv = findViewById(R.id.activity_main_webview);
        if (wv.canGoBack()) {
            wv.goBack();
        }
    }


    // Application startup logic, runs on rhino-thread, called once

    private void startApplication() {
        // assets
        File filesDir = getExternalFilesDir(null);
        unpackAssets(filesDir, getClass().getPackage().getName());

        // init rhino
        ContextFactory.initGlobal(new RhinoContextFactory());
        RHINO_CONTEXT = Context.enter();
        RHINO_SCOPE = RHINO_CONTEXT.initStandardObjects();

        FunctionObject loadFunc = new FunctionObject("load", getLoadMethod(), RHINO_SCOPE);
        RHINO_SCOPE.put("load", RHINO_SCOPE, loadFunc);
        RHINO_SCOPE.setAttributes("load", ScriptableObject.DONTENUM);

        // find startup script
        File initScriptGit = new File(filesDir, "initAndroidGit.js");
        File initScriptBundled = new File(filesDir, "app/js/initAndroid.js");
        File initScript = initScriptGit.exists() ? initScriptGit : initScriptBundled;

        // run startup script
        InputStream is = null;
        try {
            is = new FileInputStream(initScript);
            Reader reader = new InputStreamReader(is, "UTF-8");
            RHINO_CONTEXT.evaluateReader(RHINO_SCOPE, reader, initScript.getAbsolutePath(), 1, null);
        } catch (IOException e) {
            throw new RuntimeException(e);
        } finally {
            closeQuietly(is);
        }
        Context.exit();
    }

    // exposed to JS

    public void showMessage(final String message) {
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                new AlertDialog.Builder(MainActivity.this)
                        .setMessage(message)
                        .show();
            }
        });
    }

    // helper methods

    private void showError(Throwable e) {
        try {
            final String msg = Log.getStackTraceString(e);
            // write to system log
            Log.e(getClass().getPackage().getName(), msg);
            // show on screen
            showMessage(msg);
        } catch (Exception e1) {
            // give up
        }
    }

    private void unpackAssets(File topLevelDir, String path) {
        try {
            if (0 != topLevelDir.list().length) {
                return;
            }
            unpackAssetsZip(topLevelDir, path + ".zip");
        } catch(IOException e) {
            showError(e);
        }
    }

    private void unpackAssetsZip(File dir, String zipAsset) throws IOException {
        InputStream is = null;
        try {
            is = getAssets().open(zipAsset);
            ZipInputStream zis = new ZipInputStream(is);
            ZipEntry entry;
            while (null != (entry = zis.getNextEntry())) {
                File target = new File(dir, entry.getName());
                if (entry.isDirectory()) {
                    boolean success = target.mkdirs();
                    if (!success) {
                        throw new IOException("Cannot create directory: [" + target.getAbsolutePath() + "]");
                    }
                } else {
                    unpackZipFile(zis, target);
                }
            }
        } finally {
            closeQuietly(is);
        }
    }

    private void unpackZipFile(ZipInputStream zis, File target) throws IOException {
        Log.i(getClass().getPackage().getName(), "Installing: " + target.getAbsolutePath());
        FileOutputStream fos = null;
        try {
            fos = new FileOutputStream(target);
            copy(zis, fos);
        } finally {
            closeQuietly(fos);
        }
    }

    private static void closeQuietly(Closeable closeable) {
        if (null != closeable) {
            try {
                closeable.close();
            } catch (IOException e) {
                // ignore
            }
        }
    }

    private static void copy(InputStream in, OutputStream out) throws IOException {
        byte[] buffer = new byte[4096];
        int read;
        while ((read = in.read(buffer)) != -1) {
            out.write(buffer, 0, read);
        }
    }

    public static void loadRhinoScript(Context cx, Scriptable thisObj, Object[] args, Function funObj) throws Exception {
        for (Object arg : args) {
            String filePath = Context.toString(arg);
            InputStream is = null;
            Script script = null;
            try {
                is = new FileInputStream(filePath);
                Reader reader = new InputStreamReader(is, "UTF-8");
                script = cx.compileReader(RHINO_SCOPE, reader, filePath, 1, null);
            } catch (IOException e) {
                throw new RuntimeException(e);
            } finally {
                closeQuietly(is);
            }
            if (null != script) {
                script.exec(cx, RHINO_SCOPE);
            }
        }
    }

    private static Method getLoadMethod() {
        try {
            return MainActivity.class.getMethod("loadRhinoScript", Context.class,
                    Scriptable.class, Object[].class, Function.class);
        } catch (NoSuchMethodException e) {
            throw new RuntimeException(e);
        }
    }

    private static class RhinoThreadFactory implements ThreadFactory {
        @Override
        public Thread newThread(Runnable runnable) {
            Thread th = new Thread(new ThreadGroup("rhino"), runnable, "rhino-thread", 1024 * 1024 * 2);
            th.setDaemon(true);
            return th;
        }
    }

    private static class RhinoContextFactory extends ContextFactory {
        @Override
        protected boolean hasFeature(Context cx, int featureIndex) {
            if (Context.FEATURE_LOCATION_INFORMATION_IN_ERROR == featureIndex) {
                return true;
            }
            return super.hasFeature(cx, featureIndex);
        }

        @Override
        protected void onContextCreated(Context cx) {
            cx.setOptimizationLevel(-1);
            cx.setGeneratingDebug(true);
            super.onContextCreated(cx);
        }
    }
}
