'use strict';

import util from 'gulp-util';
import moment from 'moment';
import pkg from '../package.json';

var tpl = [
  '',
  '<%= pkg.name %>',
  '',
  '<%= pkg.description %>',
  '',
  '@version v<%= pkg.version %> - <%= today %>',
  '@author <%= (pkg.author && pkg.author.name) ? pkg.author.name : pkg.author %>',
  '@copyright <%= year %>(c) <%= (pkg.author && pkg.author.name) ? pkg.author.name : pkg.author %>',
  '@license <%= pkg.license %>'
].join('\n * ');

/**
 * The banner is the comment that is placed at the top of our compiled
 * source files. It is first processed as a Gulp template, where the `<%=`
 * pairs are evaluated based on this very configuration object.
 */
export const BANNER = util.template(
  '/**' + tpl + '\n */\n', {
    file: '',
    pkg: pkg,
    today: moment(new Date()).format('DD/MM/YYYY'),
    year: new Date().toISOString().substr(0, 4)
  });

/**
 * This banner is meant to be put in the html file, at the end
 */
export const BANNER_HTML = util.template(
  '<!--' + tpl + '\n-->\n', {
    file: '',
    pkg: pkg,
    today: moment(new Date()).format('DD/MM/YYYY'),
    year: new Date().toISOString().substr(0, 4)
  });
