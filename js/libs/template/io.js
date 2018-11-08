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
], function() {
    "use strict";

    var FileInputStream = Packages.java.io.FileInputStream;
    var FileOutputStream = Packages.java.io.FileOutputStream;
    var InputStreamReader = Packages.java.io.InputStreamReader;
    var StringWriter = Packages.java.io.StringWriter;
    var OutputStreamWriter = Packages.java.io.OutputStreamWriter;
    var Array = Packages.java.lang.reflect.Array;
    var Character = Packages.java.lang.Character;

    function closeQuietly(closeable) {
        if (null !== closeable) {
            try {
                closeable.close();
            } catch (e) {
                // ignore
            }
        }
    }

    function copy(reader, writer) {
        var buf = Array.newInstance(Character.TYPE, 4096);
        var read = -1;
        while (-1 !== (read = reader.read(buf, 0, buf.length))) {
            writer.write(buf, 0, read);
        }
    }

    function writeFile(path, data) {
        var writer = null;
        try {
            var fos = new FileOutputStream(path);
            writer = new OutputStreamWriter(fos, "UTF-8");
            writer.write(data, 0, data.length);
        } finally {
            closeQuietly(writer);
        }
    }

    function readFile(path) {
        var fis = null;
        try {
            fis = new FileInputStream(path);
            var reader = new InputStreamReader(fis, "UTF-8");
            var writer = new StringWriter();
            copy(reader, writer);
            return writer.toString();
        } finally {
            closeQuietly(fis);
        }
    }

    return {
        closeQuietly: closeQuietly,
        copy: copy,
        writeFile: writeFile,
        readFile: readFile
    };
});
