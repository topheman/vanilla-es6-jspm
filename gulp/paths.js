'use strict';

import path from 'path';

const root = path.dirname(__dirname);//needed so that imports could co-exist with requires (on some edge cases)

const paths = {
  gulpfile: `${root}/gulpfile.js`,
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
   */
  app: {
    basePath: `${root}/src/`,
    styles: `${root}/src/styles/**/*.scss`,
    fonts: [
      `${root}/src/fonts/**/*.{eot,svg,ttf,woff}`,
      `${root}/jspm_packages/**/*.{eot,svg,ttf,woff}`,
    ],
    images: `${root}/src/images/**/*.{png,gif,jpg,jpeg}`,
    scripts: [`${root}/src/app/**/*.js`],
    html: `${root}/src/index.html`,
    templates: `${root}/src/app/**/*.html`
  },
  config: {
    karma: `${root}/karma.conf.js`,
    e2e: `${root}/protractor.config.js`,
    jspm: `${root}/jspm.config.js`
  },
  /**
   * The 'tmp' folder is where our html templates are compiled to JavaScript during
   * the build process and then they are concatenating with all other js files and
   * copy to 'dist' folder.
   */
  tmp: {
    basePath: `${root}/.tmp/`,
    styles: `${root}/.tmp/styles/`,
    scripts: `${root}/.tmp/scripts/`,
    config: {
      basePath: `${root}/.tmp/config/`,
      jspm: `${root}/.tmp/config/jspm.config.js`
    }
  },
  build: {
    basePath: `${root}/build/`,
    dist: {
      basePath: `${root}/build/dist/`,
      fonts: `${root}/build/dist/fonts/`,
      images: `${root}/build/dist/images/`,
      styles: `${root}/build/dist/styles/`,
      scripts: `${root}/build/dist/scripts/`,
      docs: `${root}/build/dist/docs/`
    },
    docs: `${root}/build/docs/`
  },
  test: {
    basePath: `${root}/test/`,
    config: {
      jspmOverride: `${root}/test/jspm.override.json`
    },
    unit: `${root}/test/unit/**/*.js`,
    fixtures: `${root}/test/fixtures/**/*.html`,
    e2e: `${root}/test/e2e/**/*.js`,
    stubs: `${root}/test/stubs/**/*.js`
  }
};

export default paths;
