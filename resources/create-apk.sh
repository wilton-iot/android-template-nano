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

# options, set them in local env
#export ANDROIDDEV_GIT_ENABLE=true
#export ANDROIDDEV_GIT_URL=git+ssh://androiddev@192.168.1.1:app
#export ANDROIDDEV_GIT_PASSWORD=secret
#export ANDROIDDEV_GIT_BRANCH=master
#export ANDROIDDEV_LIBC_PRELOAD=true

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
APP_DIR="$SCRIPT_DIR"/..

# clean up
rm -rf $APP_DIR/android/.gradle
rm -rf $APP_DIR/android/build
rm -rf $APP_DIR/android/app/build
rm -f $APP_DIR/android/app/src/main/assets/myapp.android.zip

mkdir -p $APP_DIR/work
pushd $APP_DIR/work
# prepare assets
if [ "xtrue" == "x$ANDROIDDEV_GIT_ENABLE" ] ; then
    echo $ANDROIDDEV_GIT_URL > git-credentials.txt
    echo $ANDROIDDEV_GIT_PASSWORD >> git-credentials.txt
    echo $ANDROIDDEV_GIT_BRANCH >> git-credentials.txt
    rm -f initAndroidGit.js
    ln -s ../js/initAndroidGit.js
    zip -qr $APP_DIR/android/app/src/main/assets/myapp.android.zip initAndroidGit.js git-credentials.txt
else
    rm -f app
    ln -s .. app
    zip -qr $APP_DIR/android/app/src/main/assets/myapp.android.zip app/js app/web
fi
popd

# create apk
pushd $APP_DIR/android

if [ "xtrue" == "x$ANDROIDDEV_LIBC_PRELOAD" ] ; then
    export LD_LIBRARY_PATH=$APP_DIR/tools/libc6_2.15/lib/x86_64-linux-gnu/
fi
export ANDROID_HOME=$APP_DIR/tools/sdk
$APP_DIR/tools/gradle/bin/gradle \
        -Dorg.gradle.java.home=$JAVA_HOME \
        -Dorg.gradle.jvmargs="-XX:MaxRAM=1024M -XX:+TieredCompilation -XX:TieredStopAtLevel=1 -XX:+UseSerialGC" \
        -Dorg.gradle.parallel=false \
        -Dorg.gradle.daemon=false \
        clean assembleDebug

cp $APP_DIR/android/app/build/outputs/apk/debug/app-debug.apk $APP_DIR/android/build/myapp.apk

popd
