'use strict';

import gulp from 'gulp';
import {exec} from 'child_process';

import paths from '../paths';

/**
 * This task simply encapsulate the npm task `npm run yuidoc`
 * so that it could be integrated in the `gulp build --with-docs` workflow
 */
gulp.task('generate-docs', (cb) => {
  return exec('npm run yuidoc', (error, stdout, stderr) => {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
    cb();
  });
});

/**
 * This task simply copies generated docs from `build/docs` to `build/dist/docs`
 * `build/docs` must have been generated before
 */
gulp.task('copy-generated-docs', () => {
  return gulp.src(paths.build.docs + '**/*')
    .pipe(gulp.dest(paths.build.dist.docs));
});
