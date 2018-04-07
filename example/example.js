'use strict';
const iostatEmitterFactory = require('./../index.js');

// Initialize emitter and start monitoring process via oneliner
let iostatEmitter = iostatEmitterFactory();

// Omit factory parameter to start iostat in once per second mode
// or call with secondsPerMeasure parameter, e.g. once per 3 seconds
// let iostatEmitter = iostatEmitterFactory(3);

// Subscribe to events
iostatEmitter.on('data', (data) => {
  console.log('data:', data);  
});
iostatEmitter.on('header', (header) => {
  console.log('header:', header);
});
iostatEmitter.on('error', (error) => {
  console.error('error:', error);
});
iostatEmitter.on('close', () => {
  console.log('close');
});
iostatEmitter.on('stop', () => {
  console.log('stop');
});
iostatEmitter.on('restart', () => {
  console.log('restart');
});

// After 10 seconds restart in once per 3 seconds mode
setTimeout(() => {
  iostatEmitter.restart(5);
}, 1000 * 10);

// After 20 seconds kill iostat process 
setTimeout(() => {
  iostatEmitter.stop();
  // node can exit now
}, 1000 * 20);