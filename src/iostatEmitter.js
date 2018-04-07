'use strict';
//// =================================================================
//// External requirements
//// =================================================================
const spawn = require('child_process').spawn;
const JSONStream = require('JSONStream');
const EventEmitter = require('events');

//// =================================================================
//// Internal requirements
//// =================================================================
const ensureOS = require('./ensureOS');

//// =================================================================
//// Ensure OS compatibility at module require time  
//// =================================================================
ensureOS();
// ensureIostatInstalled(); // TODO: implement

//// =================================================================
//// ES6 class - an actual implementation, future-proof  
//// =================================================================
class IostatEmitter extends EventEmitter {
  constructor(secondsPerMeasure = 1) {
    super();
    this._secondsPerMeasure = secondsPerMeasure;
    this._iostatProcess = null;
    this._streamParser = null;
    this._isStarted = false;
    this.restart(this._secondsPerMeasure); 
  }
  stop() {
    if (this._isStarted) {
      this._iostatProcess.removeAllListeners();
      this._iostatProcess.stdout.unpipe();
      //this._iostatProcess.stdout.end();
      this._iostatProcess.stdout.destroy();
      this._iostatProcess.kill();
      this._iostatProcess = null;
      
      this._streamParser.removeAllListeners();
      this._streamParser.end();
      this._streamParser.destroy();
      this._streamParser = null;

      // TODO: check necessity of all this destructuor-alike stuff

      this._isStarted = false;
      this.emit('stop'); 
    }
  }
  restart(secondsPerMeasure = this._secondsPerMeasure) {
    this._secondsPerMeasure = secondsPerMeasure;
    if (!(this._secondsPerMeasure > 0)) {
      throw new Error('secondsPerMeasure must be positive number');
    } else {
      this.stop();
      this._streamParser = JSONStream.parse('sysstat.hosts.*.statistics.*');
      this._streamParser.on('data', (data) => {
        this.emit('data', data);
      });
      this._streamParser.on('header', (header) => {
        this.emit('header', header);
      });
      this._iostatProcess = spawn('iostat', ['-y', '-x', '-o', 'JSON', this._secondsPerMeasure]);
      this._iostatProcess.on('error', (error) => {
        this.emit('error', error);
      });
      this._iostatProcess.on('close', (code, signal) => {
        if (code !== null) {
          this.emit('error', new Error(`Exit with non-null exit-code ${code}`));
        } else {
          this.emit('close');        
        }
      });
      this._iostatProcess.on('disconnect', () => {
        // TODO: investigate whether it can really happen anyhow 
        this.emit('error', new Error('Unexpected disconnect'));
      });     
      this._iostatProcess.stdout.pipe(this._streamParser);
      this._isStarted = true;
      this.emit('restart');
    }
  }
}
//// =================================================================
//// Exporting as a factory, following Node's module best practices
//// =================================================================
function iostatEmitterFactory(...args) {
  return new IostatEmitter(...args)
}
module.exports = iostatEmitterFactory;