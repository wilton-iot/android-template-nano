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


(function(){

    var File = Packages.java.io.File;
    var FileInputStream = Packages.java.io.FileInputStream;
    var InputStreamReader = Packages.java.io.InputStreamReader;
    var StringWriter = Packages.java.io.StringWriter;
    var Array = Packages.java.lang.reflect.Array;
    var Character = Packages.java.lang.Character;
    var System = Packages.java.lang.System;

    var Log = Packages.android.util.Log;

    var Git = Packages.org.eclipse.jgit.api.Git;
    var SetupUpstreamMode = Packages.org.eclipse.jgit.api.CreateBranchCommand.SetupUpstreamMode;
    var Constants = Packages.org.eclipse.jgit.lib.Constants;
    var FileRepositoryBuilder = Packages.org.eclipse.jgit.storage.file.FileRepositoryBuilder;
    var SshSessionFactory = Packages.org.eclipse.jgit.transport.SshSessionFactory;

    var PasswordSshSessionFactory = Packages.template.android.support.jgit.PasswordSshSessionFactory;
    var MainActivity = Packages.template.android.MainActivity;

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

    function parseCredentials(str, path) {
        var lines = str.split("\n");
        if (3 !== lines.length) {
            throw new Error("Invalid git credentials, file: [" + path + "]");
        }
        var url = lines[0].trim();
        if (0 === url.length) {
            throw new Error("Invalid git credentials url, file: [" + path + "]");
        }
        var password = lines[1].trim();
        if (0 === password.length) {
            throw new Error("Invalid git credentials password, file: [" + path + "]");
        }
        var branch = lines[2].trim();
        if (0 === branch.length) {
            throw new Error("Invalid git credentials branch, file: [" + path + "]");
        }
        return {
            url: url,
            password: password,
            branch: branch
        };
    }

    function print(msg) {
        Log.i("template.android", String(msg));
    }

    function gitCheckout(url, passwd, branch, appdirPath) {
        // JGit setup for SSH
        var sf = new PasswordSshSessionFactory(passwd).withStrictHostKeyChecking(false);
        SshSessionFactory.setInstance(sf);

        // git clone app
        var appdir = new File(appdirPath);
        if (!(appdir.exists() && appdir.isDirectory())) {
            print("Performing git clone, url: [" + url + "] ...");
            Git.cloneRepository()
                    .setURI(url)
                    .setDirectory(appdir)
                    .call();
        }

        // find out repo
        var repo = new FileRepositoryBuilder()
                .setGitDir(new File(appdir, ".git"))
                .setMustExist(true)
                .build();
        var git = new Git(repo);

        // git checkout
        print("Performing git checkout, branch: [" + branch + "] ...");
        git.checkout()
                .setName(branch)
                .setUpstreamMode(SetupUpstreamMode.SET_UPSTREAM)
                .setStartPoint("origin/" + branch)
                .call();

        // git update
        print("Performing git update ...");
        git.pull().call();

        // show revision
        var revision = repo.resolve(Constants.HEAD);
        print("Git update complete, revision: [" + revision.name() + "]");
        // MainActivity.INSTANCE.showMessage("git: " + revision.name());

        // close repo
        repo.close();
    }

    // app directory
    var filesDir = MainActivity.INSTANCE.getExternalFilesDir(null);
    var appdir = new File(filesDir, "app").getAbsolutePath();
    var credsPath = new File(filesDir, "git-credentials.txt").getAbsolutePath();

    if (!new File(credsPath).exists()) {
        throw new Error("Git credentials file not found: [" + credsPath + "]");
    }

    var credsStr = readFile(credsPath);
    var creds = parseCredentials(credsStr, credsPath);

    // perform checkout
    gitCheckout(creds.url, creds.password, creds.branch, appdir);

    // start application
    load(appdir + "/js/initAndroid.js");
}());
