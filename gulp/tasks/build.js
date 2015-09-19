'use strict';

import del from 'del';
import gulp from 'gulp';
import util from 'gulp-util';
import uglify from 'gulp-uglify';
import bytediff from 'gulp-bytediff';
import size from 'gulp-size';
import minifyCss from 'gulp-minify-css';
import minifyHtml from 'gulp-minify-html';
import rev from 'gulp-rev';
import header from 'gulp-header';
import footer from 'gulp-footer';
import usemin from 'gulp-usemin';
import inject from 'gulp-inject';
import runSequence from 'run-sequence';

import {BANNER, BANNER_HTML} from '../const';
import {LOG, COLORS, WITH_DOCS} from '../utils';
import paths from '../paths';

//=============================================
//            UTILS FUNCTIONS
//=============================================

/**
 * Format a number as a percentage
 * @param  {Number} num       Number to format as a percent
 * @param  {Number} precision Precision of the decimal
 * @return {String}           Formatted percentage
 */
function formatPercent(num, precision) {
  return (num * 100).toFixed(precision);
}

/**
 * Formatter for bytediff to display the size changes after processing
 * @param  {Object} data - byte data
 * @return {String}      Difference in bytes, formatted
 */
function bytediffFormatter(data) {
  const difference = (data.savings > 0) ? ' smaller.' : ' larger.';
  return COLORS.yellow(data.fileName + ' went from ' +
    (data.startSize / 1000).toFixed(2) + ' kB to ' +
    (data.endSize / 1000).toFixed(2) + ' kB and is ' +
    formatPercent(1 - data.percent, 2) + '%' + difference);
}

//=============================================
//                  TASKS
//=============================================

/**
 * The 'clean' task delete 'build/dist' and '.tmp' directories.
 * But keeps build/dist/.git (if you git init this folder to deploy via git)
 */
gulp.task('clean', (cb) => {
  const files = [
    paths.build.dist.basePath + '*',
    '!' + paths.build.dist.basePath + '.git*',
    paths.tmp.basePath
  ];
  LOG('Cleaning: ' + COLORS.blue(files));

  return del(files, cb);
});

/**
 * Copies assets at the root of `src` to the `build/dist` folder, such as :
 * - favicon files
 * - 404.html file
 */
gulp.task('extras', () => {
  return gulp.src([paths.app.basePath + '*.{ico,png,txt}', paths.app.basePath + '404.html'])
    .pipe(gulp.dest(paths.build.dist.basePath));
});

/**
 * This task generates doc to `build/docs` and copies it to `build/dist/docs`
 * It only does it if run with correct flag: `gulp build --with-docs`
 *
 * If no flag, does nothing.
 */
gulp.task('extras-docs', (cb) => {
  if(WITH_DOCS){
    runSequence(
      ['generate-docs'],
      ['copy-generated-docs'],
      (err) => {
        if (err) {
          let exitCode = 3;
          LOG('[ERROR] gulp build task failed (docs generation step)', err);
          LOG('[FAIL] gulp build task failed (docs generation step) - exiting with code ' + exitCode);
          return process.exit(exitCode);
        }
        else {
          return cb();
        }
      }
    );
  }
  else{
    return cb();
  }
});

/**
 * The 'compile' task compile all js, css and html files.
 *
 * 1. it inject bundle into `index.html`
 * 2. css      - minify, add revision number, add banner header
 *    js       - minify, add revision number, add banner header
 *    html     - minify
 */
gulp.task('compile', ['htmlhint', 'sass', 'bundle'], () => {
  return gulp.src(paths.app.html)
    .pipe(inject(gulp.src(paths.tmp.scripts + 'app.bootstrap.build.js', {read: false}), {
      starttag: '<!-- inject:js -->'
    }))
    .pipe(inject(gulp.src(paths.app.basePath + 'analytics.snippet.html'), {
      starttag: '<!-- inject:analytics -->',
      transform: (filePath, file) => {
        // return file contents as string
        return file.contents.toString('utf8');
      }
    }))
    .pipe(usemin({
      css: [
        bytediff.start(),
        minifyCss({keepSpecialComments: 0}),
        bytediff.stop(bytediffFormatter),
        rev(),
        header(BANNER)
      ],
      js: [
        bytediff.start(),
        uglify(),
        bytediff.stop(bytediffFormatter),
        rev(),
        header(BANNER)
      ],
      html: [
        bytediff.start(),
        minifyHtml({empty: true}),
        footer(BANNER_HTML),
        bytediff.stop(bytediffFormatter)
      ]
    }))
    .pipe(gulp.dest(paths.build.dist.basePath))
    .pipe(size({title: 'compile', showFiles: true}));
});

/**
 * The 'build' task gets app ready for deployment by processing files
 * and put them into `build/dist` directory ready for deployment.
 *
 * Added callback to manage errors and exit with a clean exit code if task fails
 * (needed for CI tools such as Travis)
 */
gulp.task('build', (cb) => {
  runSequence(
    ['clean'],
    ['compile', 'extras', 'images'],
    ['extras-docs'],
    (err) => {
      if (err) {
        let exitCode = 2;
        LOG('[ERROR] gulp build task failed', err);
        LOG('[FAIL] gulp build task failed - exiting with code ' + exitCode);
        return process.exit(exitCode);
      }
      else {
        return cb();
      }
    }
  );
});
