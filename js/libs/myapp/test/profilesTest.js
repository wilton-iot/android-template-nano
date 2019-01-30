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
    "./assert",
    "../profiles"
], function(assert, profiles) {
    "use strict";

    print("test: profiles");

    var empty = {
        foo: "",
        baz: 0
    };

    var pr = {
        foo: "bar",
        baz: 42
    };

    // save
    profiles.saveDefault(empty);
    profiles.save("test", pr);
    assert.throws(function() { profiles.save("foo bar", pr); });
    assert.throws(function() { profiles.save(null, pr); });
    assert.throws(function() { profiles.save("", pr); });

    // load
    // named
    var loaded = profiles.load("test");
    assert.equal(loaded, pr);
    var failed = profiles.load("fail");
    assert.equal(failed, empty);
    assert.throws(function() { profiles.load("foo bar"); });
    assert.throws(function() { profiles.load(null); });
    assert.throws(function() { profiles.load(""); });
    // active
    var activeName = profiles.findActiveName();
    var active = profiles.load(activeName);
    assert.equal(active, pr);

    // remove
    profiles.remove("test");
    var em = profiles.load("test");
    assert.equal(em, empty);
});


