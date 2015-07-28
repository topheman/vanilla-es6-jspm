'use strict';

//inspired by the gulpfile.js from https://github.com/martinmicunda/employee-scheduling-ui

//use babel transpiler for ES6 files in node without needing --harmony nor a gulpfile.babel.js
require('babel/register');

// require all tasks
require('require-dir')('./gulp/tasks', { recurse: true });

/**
 * Load required dependencies.
 */
var pkg = require('./package.json');
var del = require('del');
var gulp = require('gulp');
var modRewrite = require('connect-modrewrite');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var paths = require('./gulp/paths');

/**
 * Load Gulp plugins listed in 'package.json' and attaches
 * them to the `$` variable.
 */
var $ = require('gulp-load-plugins')();

//=============================================
//            DECLARE VARIABLES
//=============================================

var log = $.util.log;
var argv = $.util.env;
var ENV = !!argv.env ? argv.env : 'dev';
var COLORS = $.util.colors;

//=============================================
//            UTILS FUNCTIONS
//=============================================

function startBrowserSync(baseDir, files, browser) {
  browser = browser === undefined ? 'default' : browser;
  files = files === undefined ? 'default' : files;

  browserSync({
    files: files,
    port: 9000,
    notify: false,
    server: {
      baseDir: baseDir,
      middleware: [
        //proxyMiddleware,
        modRewrite(['!\\.\\w+$ /index.html [L]']) // require for HTML5 mode
      ]
    },
    browser: browser
  });
}

//=============================================
//               SUB TASKS
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
  log('Cleaning: ' + COLORS.blue(files));

  return del(files, cb);
});

/**
 * The 'jshint' task defines the rules of our hinter as well as which files
 * we should check. It helps to detect errors and potential problems in our
 * JavaScript code.
 */
gulp.task('jshint', function () {
  return gulp.src(paths.app.scripts.concat(paths.gulpfile))
    .pipe($.jshint('.jshintrc'))
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.jshint.reporter('fail'));
});

/**
 * The 'htmlhint' task defines the rules of our hinter as well as which files we
 * should check. It helps to detect errors and potential problems in our
 * HTML code.
 * @todo
 */
gulp.task('htmlhint', function () {
  process.stdout.write('TODO htmlhint\n');
});

/**
 * Compile SASS files into the main.css.
 */
gulp.task('sass', function () {
  // if it's set to `true` the gulp.watch will keep gulp from stopping
  // every time we mess up sass files
  var errLogToConsole = ENV === 'dev' || ENV === 'test';
  return gulp.src(paths.app.styles)
    .pipe($.changed(paths.tmp.styles, {extension: '.scss'}))
    .pipe($.sourcemaps.init())
    .pipe($.sass({style: 'compressed', errLogToConsole: errLogToConsole}))
    .pipe($.autoprefixer('last 2 version'))
    .pipe($.concat('main.css'))
    .pipe($.sourcemaps.write('../maps'))
    .pipe(gulp.dest(paths.tmp.styles))
    .pipe($.filter('**/*.css')) // Filtering stream to only css files
    .pipe(browserSync.reload({stream: true}));
});

/**
 * Create JS production bundle.
 */
gulp.task('bundle', ['jshint'], function (cb) {
  var Builder = require('systemjs-builder');
  var builder = new Builder();
  var inputPath = 'src/app/bootstrap';
  var outputFile = paths.tmp.scripts + 'app.bootstrap.build.js';
  var outputOptions = {sourceMaps: true, config: {sourceRoot: paths.tmp.scripts}};

  builder.loadConfig('./jspm.config.js')
    .then(function () {
      builder.buildSFX(inputPath, outputFile, outputOptions)
        .then(function () {
          return cb();
        })
        .catch(function (ex) {
          cb(new Error(ex));
        });
    });
});

/**
 * The 'watch' task set up the checks to see if any of the files listed below
 * change, and then to execute the listed tasks when they do.
 */
gulp.task('watch', function () {
  // Watch images and fonts files
  gulp.watch([paths.app.assets.images, paths.app.assets.fonts], [browserSync.reload]);

  // Watch css files
  gulp.watch(paths.app.styles, ['sass']);

  // Watch js files
  gulp.watch([paths.app.scripts, paths.gulpfile], ['jshint', browserSync.reload]);

  // Watch html files
  gulp.watch([paths.app.html, paths.app.templates], ['htmlhint', browserSync.reload]);
});

//@todo complete (uglify / env based / ngAnnotate ...) + jsdoc
gulp.task('compile', ['htmlhint', 'sass', 'bundle'], function () {
  return gulp.src(paths.app.html)
    .pipe($.inject(gulp.src(paths.tmp.scripts + 'app.bootstrap.build.js', {read: false})), {
      starttag: '<!-- inject:js -->'
    })
    .pipe($.usemin({}))
    .pipe(gulp.dest(paths.build.dist.basePath))
    .pipe($.size({title: 'compile', showFiles: true}));
});

//=============================================
//                MAIN TASKS
//=============================================

//---------------------------------------------
//              DEVELOPMENT TASKS
//---------------------------------------------

/**
 * The 'serve' task serve the dev environment.
 */
gulp.task('serve', ['sass', 'watch'], function () {
  startBrowserSync(['.tmp', 'src', 'jspm_packages', './']);
});
gulp.task('default', ['serve']);

//---------------------------------------------
//               BUILD TASKS
//---------------------------------------------

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