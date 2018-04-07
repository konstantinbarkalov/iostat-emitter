'use strict';

describe('iostat', () => {
  describe('aviability', () => {
    it('should exec sysstat without error', (done) => {
      const execFile = require('child_process').execFile;
      this._iostatProcess = execFile('iostat', [], done);
    });
  });
  describe('bugless', () => {
    it('should return proper JSON', () => {
      const execFile = require('child_process').execFile;
      this._iostatProcess = execFile('iostat', ['-o', 'JSON'], (error, stdout) => {
        (() => {
          JSON.parse(stdout);
        }).should.not.to.throw();
      });
    });
  });
});
