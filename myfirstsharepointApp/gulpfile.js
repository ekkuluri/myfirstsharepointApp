'use strict';

const gulp = require('gulp');
const build = require('@microsoft/sp-build-web');
const spsync = require('gulp-spsync-creds').sync;
const minimist = require('minimist');

const environmentInfo = {
    "username": "<production-username>",
    "password": "<production-password>",
    "cdnSite": "<cdn-site-relative-path>",
};

// build.addSuppression(`Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.`);

const options = minimist(process.argv.slice(2));


build.task('upload-app-pkg', {
    execute: (config) => {
        return new Promise((resolve, reject) => {
            const pkgFile = require('./config/package-solution.json');
            // Retrieve the filename from the package solution config file
            if (pkgFile) {
                const folderLocation = `./sharepoint/${pkgFile.paths.zippedPackage}`;

                return gulp.src(folderLocation)
                    .pipe(spsync({
                        "username": environmentInfo.username,
                        "password": environmentInfo.password,
                        "site": environmentInfo.cdnSite,
                        "libraryPath": "AppCatalog",
                        "publish": true
                    }))
                    .on('finish', resolve);
            }
        });
    }
});


build.task('upload-assets', {
    execute: (config) => {
        return new Promise((resolve, reject) => {
            const deployFolder = require('./config/copy-assets.json');
            if (deployFolder) {
                // Retrieve the deploy folder path from the assets config file
                const folderLocation = `./${deployFolder.deployCdnPath}/**/*.*`;

                return gulp.src(folderLocation)
                    .pipe(spsync({
                        "username": environmentInfo.username,
                        "password": environmentInfo.password,
                        "site": environmentInfo.cdnSite,
                        "libraryPath": "CDNAssets",
                        "publish": true
                    }))
                    .on('finish', resolve);
            }
        });
    }
});

gulp.task("deploy-sharepoint", () => {
    environmentInfo.username = options['username'];
    environmentInfo.password = options['password'];
    environmentInfo.cdnSite = options['cdnSite'];
    runSequential(["upload-app-pkg", "upload-assets"])
}
);


build.initialize(gulp);

function runSequential(tasks) {
    if (!tasks || tasks.length <= 0) return;

    const task = tasks[0];
    gulp.start(task, () => {
        console.log(`${task} finished`);
        runSequential(tasks.slice(1));
    });
}



// gulp command to pass arguments dynamically
// gulp deploy-sharepoint  --username ******* --password ******* --cdnSite *******