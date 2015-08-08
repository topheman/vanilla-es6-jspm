'use strict';

import gulp from 'gulp';
import cache from 'gulp-cache';
import size from 'gulp-size';
import imagemin from 'gulp-imagemin';

import paths from '../paths';

/**
 * The 'images' task minifies and copies images to `build/dist` directory.
 */
gulp.task('images', () => {
  return gulp.src(paths.app.images)
    .pipe(cache(imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest(paths.build.dist.images))
    .pipe(size({title: 'images'}));
});
