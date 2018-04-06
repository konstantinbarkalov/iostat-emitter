'use strict';
function ensureOS() {
  if (process.platform !== 'linux'   &&
      process.platform !== 'freebsd' &&
      process.platform !== 'linux'   &&
      process.platform !== 'openbsd') {
    throw new Error('OS is not supported');
  }
}
module.exports = ensureOS;
