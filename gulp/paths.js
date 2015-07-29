'use strict';

const paths = {
  gulpfile: 'gulpfile.js',
  /**
   * This is a collection of file patterns that refer to our app code (the
   * stuff in `src/`). These file paths are used in the configuration of
   * build tasks.
   *
   * - 'styles'       contains all project css styles
   * - 'images'       contains all project images
   * - 'fonts'        contains all project fonts
   * - 'scripts'      contains all project javascript except config-env.js and unit test files
   * - 'html'         contains main html files
   * - 'templates'    contains all project html templates
   * - 'config'       contains Angular app config files - @todo not sure for the moment
   */
  app: {
    basePath: 'src/',
    fonts: [
      'src/fonts/**/*.{eot,svg,ttf,woff}',
      'jspm_packages/**/*.{eot,svg,ttf,woff}'
    ],
    styles: 'src/styles/**/*.scss',
    assets: {
      images: 'src/assets/images/**/*.{png,gif,jpg,jpeg}',
      fonts: ['src/assets/fonts/**/*.{eot,svg,ttf,woff}', 'jspm_packages/**/*.{eot,svg,ttf,woff}']
    },
    scripts: [
      'src/app/**/*.js',
      '!src/app/**/*.spec.js'
    ],
    html: 'src/index.html',
    templates: 'src/app/**/*.html'
  },
  /**
   * The 'tmp' folder is where our html templates are compiled to JavaScript during
   * the build process and then they are concatenating with all other js files and
   * copy to 'dist' folder.
   */
  tmp: {
    basePath: '.tmp/',
    styles: '.tmp/styles/',
    scripts: '.tmp/scripts/'
  },
  build: {
    basePath: 'build/',
    dist: {
      basePath: 'build/dist/',
      fonts: 'build/dist/assets/fonts',
      images: 'build/dist/assets/images/',
      styles: 'build/dist/styles/',
      scripts: 'build/dist/scripts/'
    },
    docs: 'build/docs/'
  }
};

export default paths;