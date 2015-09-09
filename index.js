'use strict';
var fs = require('fs');
var gutil = require('gulp-util');
var streamfilter = require('streamfilter');
var parser = require('gitignore-parser');

module.exports = function (fp, options) {
  options = options || {};
  fp = fp || '.gitignore';

  if (!fs.existsSync(fp)) {
    throw new gutil.PluginError('gulp-gitignore', '`file` not found');
  }

  var gitignore = parser.compile(fs.readFileSync(fp, 'utf8'));
  return streamfilter(function (file, enc, cb) {
    var match = gitignore.denies(file.relative);
    cb(match);
  }, {
    objectMode: true,
    passthrough: options.passthough !== false,
    restore: options.restore
  });
};
