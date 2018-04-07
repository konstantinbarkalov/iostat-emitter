'use strict';
const sinon = require("sinon");
const iostatEmitterFactory = require('./../index.js');

describe('iostat-emitter', () => {
  describe('basic', () => {
    it('should create instance without error', (done) => {
      (() => {
        let iostatEmitter = iostatEmitterFactory();
        iostatEmitter.on('stop', () => {
          done();
        });
        iostatEmitter.stop();
      }).should.not.to.throw();
    });
	});
	describe('data', () => {
		let iostatEmitter = iostatEmitterFactory();
		let errorEventSpy = sinon.spy();
    iostatEmitter.on('error', errorEventSpy);
		
		let dataPromise = new Promise((resolve) => {
			iostatEmitter.on('data', (data) => {
				iostatEmitter.stop();
				resolve(data);
			});
		});
		describe('await data event', () => {
			it('should emit data', () => {
				return dataPromise.should.eventually.be.fulfilled;
			});
		});
		describe('without error', () => {
			it('should not emit error while getting data', () => {				
				return dataPromise.then(errorEventSpy.should.not.be.called);
			});
		});
		describe('check data format', () => {			
			describe('root level', () => {
				it('data should has correct root keys', () => {				
					return dataPromise.should.eventually.to.be.an('object').that.has.keys('avg-cpu','disk');
				});
			});
			describe('deep level', () => {
				it('data should has correct inner avg-cpu keys', () => {				
					return dataPromise.then(data => data['avg-cpu']).should.eventually.to.be.an('object').that.has.keys(
						'idle', 'iowait', 'nice', 'steal', 'system', 'user',
					);
				});
				it('data should has correct inner disk[0] keys', () => {				
					return dataPromise.then(data => data['disk'][0]).should.eventually.to.be.an('object').that.has.keys(
						'aqu-sz', 'disk_device', 'r/s', 'r_await', 'rareq-sz', 'rkB/s', 
						'rrqm', 'rrqm/s', 'svctm', 'util', 'w/s', 'w_await', 'wareq-sz', 'wkB/s', 'wrqm', 'wrqm/s',
					);
				});
			});
		});
	});
  describe('restart-stop-stop sequence', () => {
    let iostatEmitter = iostatEmitterFactory();
    let restartEventSpy = sinon.spy();
    let stopEventSpy = sinon.spy();
    iostatEmitter.on('restart', restartEventSpy);
    iostatEmitter.on('stop', stopEventSpy);
    sinon.spy(iostatEmitter, 'restart');
    sinon.spy(iostatEmitter, 'stop');

    describe('step 0', () => {
      it('should not emit "restart" on start', () => {
        return restartEventSpy.should.not.have.been.called;
      });
      it('should not emit "stop" on start', () => {
        return stopEventSpy.should.not.have.been.called;
      });
    });

    describe('step 1', () => {
    it('should call restart', () => {      
      iostatEmitter.restart();  
      return iostatEmitter.restart.called;
    });
    
    });
    
    describe('step 2', () => {
      it('should emit "stop" once', () => {
        return restartEventSpy.should.have.been.calledOnce;
      });

      it('should emit "restart" once', () => {
        return stopEventSpy.should.have.been.calledOnce;
      });

      it('should emit "stop" and "restart" in order', () => {
        return restartEventSpy.should.have.been.calledAfter(stopEventSpy);
      });

    });
      
    describe('step 3', () => {
      it('should call stop', () => {      
        iostatEmitter.stop();  
        return iostatEmitter.stop.called;
      })
    });
    
    describe('step 4', () => {
      it('should emit "stop" once again', () => {
        return stopEventSpy.should.have.been.calledTwice;
      });

      it('should not emit "restart"', () => {
        return restartEventSpy.should.have.been.calledOnce;
      });
    });
    
    describe('step 5', () => {
      it('should call stop again', () => {      
        iostatEmitter.stop();  
        return iostatEmitter.stop.called;
      })
    });

    describe('step 6', () => {
      it('should not emit "stop"', () => {
        return stopEventSpy.should.have.been.calledTwice;
      });

      it('should not emit "restart"', () => {
        return restartEventSpy.should.have.been.calledOnce;
      });
    });

  });
  
});