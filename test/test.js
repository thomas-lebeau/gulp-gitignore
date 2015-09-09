'use strict';
var should = require('should');
var path = require('path');
var gutil = require('gulp-util');
var gitignore = require('../');

var fake = function (fakePath) {
  var base = __dirname + '/../';
  return new gutil.File({
    base: base,
    path: path.join(base, fakePath)
  });
};

describe('gitignore()', function () {
  it('should load default .gitignore', function (cb) {
    var stream = gitignore();
    var buffer = [];

    stream.on('data', function (file) {
      buffer.push(file);
    });

    stream.on('end', function () {
      buffer.should.have.length(2);
      buffer.should.containEql(fake('foo.txt'));
      buffer.should.containEql(fake('bar.txt'));
      cb();
    });

    stream.write(fake('foo.txt'));
    stream.write(fake('bar.txt'));
    stream.write(fake('node_modules/foo.txt'));

    stream.end();
  });

  it('should accept custom gitignore file', function (cb) {
    var stream = gitignore('test/.gitignore-custom');
    var buffer = [];

    stream.on('data', function (file) {
      buffer.push(file);
    });

    stream.on('end', function () {
      buffer.should.have.length(2);
      buffer.should.containEql(fake('foo.txt'));
      buffer.should.containEql(fake('foo/a.txt'));
      cb();
    });

    stream.write(fake('foo.txt'));
    stream.write(fake('bar.txt'));
    stream.write(fake('foo/a.txt'));
    stream.write(fake('foo/b.txt'));
    stream.write(fake('bar/a.txt'));
    stream.write(fake('foo.log'));
    // stream.write(fake('baz/foo.log'));

    stream.end();
  });

  it('should work with dotfiles', function (cb) {
    var stream = gitignore('test/.gitignore-custom');
    var buffer = [];

    stream.on('data', function (file) {
      buffer.push(file);
    });

    stream.on('end', function () {
      buffer.should.have.length(3);
      buffer.should.containEql(fake('foo.txt'));
      buffer.should.containEql(fake('foo/a.txt'));
      buffer.should.containEql(fake('.gitkeep'));
      cb();
    });

    stream.write(fake('foo.txt'));
    stream.write(fake('bar.txt'));
    stream.write(fake('foo/a.txt'));
    stream.write(fake('foo/b.txt'));
    stream.write(fake('bar/a.txt'));
    stream.write(fake('.gitkeep'));
    stream.write(fake('.DS_Store'));
    // stream.write(fake('baz/.DS_Store'));

    stream.end();
  });

  it('should trow proper error if gitignore path is invalid', function (cb) {
    (function () {
      gitignore('non-existant/.gitignore');
    }).should.throw()
    cb();
  });
});

/**
 * It will fail untill gitignore-parser() fixes its bug.
 * @see https://github.com/codemix/gitignore-parser/pull/10
 */
describe('[dependencies] gitignore-parser()', function () {
  it('should ignore files in all subfolders', function (cb) {
    var stream = gitignore('test/.gitignore-custom');
    var buffer = [];

    stream.on('data', function (file) {
      buffer.push(file);
    });

    stream.on('end', function () {
      buffer.should.have.length(3);
      buffer.should.containEql(fake('foo.txt'));
      buffer.should.containEql(fake('foo/a.txt'));
      buffer.should.containEql(fake('.gitkeep'));
      cb();
    });

    stream.write(fake('foo.txt'));
    stream.write(fake('bar.txt'));
    stream.write(fake('foo/a.txt'));
    stream.write(fake('foo/b.txt'));
    stream.write(fake('bar/a.txt'));
    stream.write(fake('.gitkeep'));
    stream.write(fake('.DS_Store'));

    // these files should be ignored
    stream.write(fake('baz/foo.log'));
    stream.write(fake('baz/.DS_Store'));

    stream.end();
  })
});
