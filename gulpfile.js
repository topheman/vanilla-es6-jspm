'use strict';

//inspired by the gulpfile.js from https://github.com/martinmicunda/employee-scheduling-ui

//use babel transpiler for ES6 files in node without needing --harmony nor a gulpfile.babel.js
require('babel/register');

// require all tasks
require('require-dir')('./gulp/tasks', {recurse: true});

require('gulp').task('default', ['serve']);
