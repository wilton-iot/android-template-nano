#!/bin/bash
#
# Copyright 2018, alex at staticlibs.net
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

set -e
set -x

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
APP_DIR="$SCRIPT_DIR"/..

# build
"$APP_DIR"/resources/create-apk.sh

# restart adb server
# sudo "$APP_DIR"/tools/adb/adb kill-server
# sudo "$APP_DIR"/tools/adb/adb start-server

# uninstall
"$APP_DIR"/tools/adb/adb uninstall myapp.android

# install
"$APP_DIR"/tools/adb/adb install ./android/build/myapp.apk

# run
"$APP_DIR"/tools/adb/adb shell am start -a android.intent.action.MAIN -n myapp.android/.MainActivity

# show logs
"$APP_DIR"/resources/logcat-apk.sh
