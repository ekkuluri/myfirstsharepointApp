'use strict';

const gulp = require('gulp');
const build = require('@microsoft/sp-build-web');
const spsync = require('gulp-spsync-creds').sync;

build.addSuppression(`Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.`);


build.task('upload-app-pkg', {
    execute: (config) => {
        return new Promise((resolve, reject) => {
            const pkgFile = require('./config/package-solution.json');
            const folderLocation = `./sharepoint/${pkgFile.paths.zippedPackage}`;

            return gulp.src(folderLocation)
                .pipe(spsync({
                    "username": "xxxxxxxxx",
                    "password": "xxxxxxxxx",
                    "site": "https://spaureus.sharepoint.com/sites/eRavi",
                    "libraryPath": "AppCatalog",
                    "publish": true
                }))
                .on('finish', resolve);
        });
    }
});


build.task('upload-assets', {
    execute: (config) => {
        return new Promise((resolve, reject) => {
            const deployFolder = require('./config/copy-assets.json');
            const folderLocation = `./${deployFolder.deployCdnPath}/**/*.*`;

            return gulp.src(folderLocation)
                .pipe(spsync({
                    "username": "xxxxxxxxx",
                    "password": "xxxxxxxxx",
                    "site": "https://spaureus.sharepoint.com/sites/eRavi",
                    "libraryPath": "CDNAssets",
                    "publish": true
                }))
                .on('finish', resolve);
        });
    }
});


gulp.task("deploy-sharepoint", () => runSequential(
    ["upload-app-pkg", "upload-assets"])
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