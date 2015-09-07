'use strict';
var parser = require('gitignore-parser');
var fs = require('fs');
var streamfilter = require('streamfilter');

module.exports = function (fp, options) {
  options = options || {};
  if (!fp) {
    fp = '.gitignore';
  }

  if (!fs.existsSync(fp)) {
    return [];
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
