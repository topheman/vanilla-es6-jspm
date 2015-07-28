'use strict';

import del from 'del';
import gulp from 'gulp';
import util from 'gulp-util';
import size from 'gulp-size';
import usemin from 'gulp-usemin';
import inject from 'gulp-inject';
import runSequence from 'run-sequence';

import paths from '../paths';

//=============================================
//            UTILS FUNCTIONS
//=============================================

const LOG = util.log;
const COLORS = util.colors;

//=============================================
//                  TASKS
//=============================================

/**
 * The 'clean' task delete 'build' and '.tmp' directories.
 * But keeps build/dist/.git (if you git init this folder to push to production via git)
 */
gulp.task('clean', function (cb) {
  var files = [
    paths.build.dist.basePath+'*',
    '!'+paths.build.dist.basePath+'.git*',
    paths.tmp.basePath
  ];
  LOG('Cleaning: ' + COLORS.blue(files));

  return del(files, cb);
});

//@todo complete (uglify / env based / ngAnnotate ...) + jsdoc
gulp.task('compile', ['htmlhint', 'sass', 'bundle'], function () {
  return gulp.src(paths.app.html)
    .pipe(inject(gulp.src(paths.tmp.scripts + 'app.bootstrap.build.js', {read: false})), {
      starttag: '<!-- inject:js -->'
    })
    .pipe(usemin({}))
    .pipe(gulp.dest(paths.build.dist.basePath))
    .pipe(size({title: 'compile', showFiles: true}));
});

/**
 * The 'build' task gets app ready for deployment by processing files
 * and put them into directory ready for production.
 */
//@todo manage environment / root files like .ico .htaccess ... / fonts ?
gulp.task('build', function (cb) {
  runSequence(
    ['clean'],
    ['compile','images'],
    cb
  );
});