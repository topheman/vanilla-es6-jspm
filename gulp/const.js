'use strict';

import util from 'gulp-util';
import moment from 'moment';
import pkg from '../package.json';

/**
 * The banner is the comment that is placed at the top of our compiled
 * source files. It is first processed as a Gulp template, where the `<%=`
 * pairs are evaluated based on this very configuration object.
 */
export const BANNER = util.template(
  '/**\n' +
  ' * <%= pkg.name %>\n' +
  ' *\n' +
  ' * <%= pkg.description %>\n' +
  ' *\n' +
  ' * @version v<%= pkg.version %> - <%= today %>\n' +
  ' * @author <%= (pkg.author && pkg.author.name) ? pkg.author.name : pkg.author %>\n' +
  ' * @copyright <%= year %>(c) <%= (pkg.author && pkg.author.name) ? pkg.author.name : pkg.author %>\n' +
  ' * @license <%= pkg.license %>\n' +
  ' */\n', {
    file: '',
    pkg: pkg,
    today: moment(new Date()).format('DD/MM/YYYY'),
    year: new Date().toISOString().substr(0, 4)
  });
