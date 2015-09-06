'use strict';
var assert = require('assert');
var gulpGitignore = require('./');

it('should ', function () {
  assert.strictEqual(gulpGitignore('unicorns'), 'unicorns & rainbows');
});
