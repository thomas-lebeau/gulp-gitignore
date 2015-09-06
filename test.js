'use strict';
var assert = require('assert');
var path = require('path');
var fs = require('fs');
var sinon = require('sinon');
var gutil = require('gulp-util');
var gitignore = require('./');

var fake = function (fakePath) {
  return new gutil.File({
    base: __dirname,
    path: path.join(__dirname, fakePath)
  });
};

describe('gitignore()', function () {
  beforeEach(function () {
    this.stub = sinon.stub(fs, 'readFileSync');

    var contents = [
      'foo',
      '!foo/b.txt',
      'bar   ',
      '#foobar',
      '',
      '  ',
      'b.txt',
      '**/.DS_Store',
      '!foo/bar/.gitkeep'
    ].join('\n');

    this.stub.withArgs('.gitignore', 'utf8').returns(contents);
    this.stub.withArgs('foo/.gitignore', 'utf8').returns(contents);

    this.stub2 = sinon.stub(fs, 'existsSync').returns(true);
  });

  afterEach(function () {
    this.stub.restore();
    this.stub2.restore();
  });

  it('should work without any args', function (cb) {
    var stream = gitignore();
    var buffer = [];

    stream.on('data', function (file) {
      buffer.push(file);
    });

    stream.on('end', function () {
      assert.equal(buffer.length, 3);
      assert.deepEqual(buffer, [
        fake('foo/b.txt'),
        fake('a.txt'),
        fake('c.txt')
      ]);
      cb();
    });

    stream.write(fake('foo/a.txt'));
    stream.write(fake('foo/b.txt'));
    stream.write(fake('bar/a.txt'));
    stream.write(fake('a.txt'));
    stream.write(fake('b.txt'));
    stream.write(fake('c.txt'));
    stream.write(fake('.dotfile'));

    stream.end();
  });

  it('should work with custom gitignore path', function (cb) {
    var stream = gitignore('foo/.gitignore');
    var buffer = [];

    stream.on('data', function (file) {
      buffer.push(file);
    });

    stream.on('end', function () {
      assert.equal(buffer.length, 3);
      assert.deepEqual(buffer, [
        fake('foo/b.txt'),
        fake('a.txt'),
        fake('c.txt')
      ]);
      cb();
    });

    stream.write(fake('foo/a.txt'));
    stream.write(fake('foo/b.txt'));
    stream.write(fake('bar/a.txt'));
    stream.write(fake('a.txt'));
    stream.write(fake('b.txt'));
    stream.write(fake('c.txt'));
    stream.write(fake('.dotfile'));

    stream.end();
  });

  // NOTE: this one work only alone. async pb?
  it.skip('should extend .gitignore with pattern', function (cb) {
    var stream = gitignore('.gitignore', ['c.txt']);
    var buffer = [];

    stream.on('data', function (file) {
      buffer.push(file);
    });

    stream.on('end', function () {
      assert.equal(buffer.length, 2);
      assert.deepEqual(buffer, [
        fake('foo/b.txt'),
        fake('a.txt')
      ]);
      cb();
    });

    stream.write(fake('foo/a.txt'));
    stream.write(fake('foo/b.txt'));
    stream.write(fake('bar/a.txt'));
    stream.write(fake('a.txt'));
    stream.write(fake('b.txt'));
    stream.write(fake('c.txt'));

    stream.end();
  });

  it('should work with dotfiles', function (cb) {
    var stream = gitignore('.gitignore', {dot: true});
    var buffer = [];

    stream.on('data', function (file) {
      buffer.push(file);
    });

    stream.on('end', function () {
      assert.equal(buffer.length, 5);
      assert.deepEqual(buffer, [
        fake('foo/b.txt'),
        fake('a.txt'),
        fake('c.txt'),
        fake('.dotfile'),
        fake('foo/bar/.gitkeep')
      ]);
      cb();
    });

    stream.write(fake('foo/a.txt'));
    stream.write(fake('foo/b.txt'));
    stream.write(fake('bar/a.txt'));
    stream.write(fake('a.txt'));
    stream.write(fake('b.txt'));
    stream.write(fake('c.txt'));
    stream.write(fake('.dotfile'));
    stream.write(fake('.DS_Store'));
    stream.write(fake('foo/bar/.gitkeep'));
    stream.write(fake('baz/.DS_Store'));

    stream.end();
  });
});
