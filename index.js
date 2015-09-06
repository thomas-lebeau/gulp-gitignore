'use strict';
var filter = require('gulp-filter');
var gitignore = require('parse-gitignore')('.gitignore');
var startsWith = require('starts-with');

module.exports = function (options) {
  options = options || {};
  var inverted = gitignore.map(function (pattern) {
    return startsWith(pattern, '!')? pattern.slice(1) : '!' + pattern;
  })
  inverted.unshift('**/*');

  return filter(inverted, options);
};
