'use strict';

import gulp from 'gulp';
import util from 'gulp-util';
import sass from 'gulp-sass';
import changed from 'gulp-changed';
import sourcemaps from 'gulp-sourcemaps';
import autoprefixer from 'gulp-autoprefixer';
import concat from 'gulp-concat';
import filter from 'gulp-filter';
import browserSync from 'browser-sync';

import paths from '../paths';

/**
 * Compile SASS files into the main.css.
 */
gulp.task('sass', () => {
  return gulp.src(paths.app.styles)
    .pipe(changed(paths.tmp.styles, {extension: '.scss'}))
    .pipe(sourcemaps.init())
    .pipe(sass({style: 'compressed'}).on('error', sass.logError))
    .pipe(autoprefixer('last 2 version'))
    .pipe(concat('main.css'))
    .pipe(sourcemaps.write('../maps'))
    .pipe(gulp.dest(paths.tmp.styles))
    .pipe(filter('**/*.css')) // Filtering stream to only css files
    .pipe(browserSync.reload({stream: true}));
});
