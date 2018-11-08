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
    "template/utils/listProperties"
], function(listProperties) {
    "use strict";
    
    function assert(expr) {
        if (!expr) {
            throw new Error("Assertion failed");
        }
    }

    assert.equal = function(actual, expected, message) {
        if (actual === expected) {
            return;
        }
        if (actual instanceof Array && expected instanceof Array &&
                actual.length === expected.length) {
            for (var i = 0; i < actual.length; i++) {
                assert.equal(actual[i], expected[i], i);
            }
            return;
        }
        if ("object" === typeof(actual) && "object" === typeof(expected)) {
            var actualKeys = listProperties(actual);
            var expectedKeys = listProperties(expected);
            assert.equal(actualKeys, expectedKeys);
            for (key in actual) {
                if (actual.hasOwnProperty(key)) {
                    var val = actual[key];
                    assert.equal(val, expected[key], key);
                }
            }
            return;
        }
        if (actual != expected) {
            throw new Error("Assertion failed," +
                    " expected: [" + expected + "]," +
                    " actual: [" + actual + "]," +
                    " message: [" + (message || "") + "]");
        }
    };

    assert.throws = function(fun) {
        var thrown = false;
        try {
            fun();
        } catch(e) {
            thrown = true;
        }
        assert(thrown);
    };

    return assert;
});

