'use strict';
const iostatEmitter = require('./src/iostatEmitter.js')();
iostatEmitter.on('data', (data) => {
  console.log('data', data);  
});
iostatEmitter.on('header', (header) => {
  console.log('header', header);
});
iostatEmitter.on('error', (error) => {
  console.error('error', error);
});
iostatEmitter.on('end', () => {
  console.log('end');
});
iostatEmitter.on('stop', () => {
  console.log('stop');
});
iostatEmitter.on('start', () => {
  console.log('start');
});

setTimeout(()=>{
  iostatEmitter.restart(5);
}, 1000 * 10);

setTimeout(()=>{
  iostatEmitter.stop();
}, 1000 * 20);