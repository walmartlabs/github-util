var chai = require('chai'),
      expect = chai.expect,
    childProcess = require('child_process'),
    localInfo = require('../lib/local-info'),
    path = require('path'),
    sinon = require('sinon');

describe('repo-state', function() {
  beforeEach(function() {
    this.sandbox = sinon.sandbox.create({
      injectInto: this,
      properties: ["spy", "stub"]
    });
  });
  afterEach(function() {
    this.sandbox.restore();
  });

  describe('#githubName', function() {
    it('should lookup local repo', function(done) {
      localInfo.githubName(__dirname, function(err, origin) {
        expect(origin).to.equal('walmartlabs/github-util');
        done();
      });
    });

    it('should select origin for multiple instances', function() {
      this.stub(childProcess, 'exec', function(exec, options, callback) {
        callback(undefined,
          'origin  git@github.com:kpdecker/github-util.git (fetch)\n'
          + 'origin  git@github.com:kpdecker/github-util.git (push)\n'
          + 'upstream  git@github.com:walmartlabs/github-util.git (fetch)\n'
          + 'upstream  git@github.com:walmartlabs/github-util.git (push)\n');
      });
      localInfo.githubName(__dirname, function(err, origin) {
        expect(origin).to.equal('kpdecker/github-util');
      });
    });

    it('should handle errors', function() {
      this.stub(childProcess, 'exec', function(exec, options, callback) {
        callback(new Error('It failed'));
      });

      var spy = this.spy();
      localInfo.githubName(__dirname, spy);
      expect(spy.callCount).to.equal(1);
      expect(spy.calledWith(new Error('It failed'))).to.be.true;
    });
  });

  describe('#firstCommit', function() {
    it('should lookup local repo', function(done) {
      localInfo.firstCommit(__dirname, function(err, first) {
        expect(first).to.equal('71f5fa4');
        done();
      });
    });

    it('should handle errors', function() {
      this.stub(childProcess, 'exec', function(exec, options, callback) {
        callback(new Error('It failed'));
      });

      var spy = this.spy();
      localInfo.firstCommit(__dirname, spy);
      expect(spy.callCount).to.equal(1);
      expect(spy.calledWith(new Error('It failed'))).to.be.true;
    });
  });

  describe('#commitTime', function() {
    it('should lookup local repo', function(done) {
      localInfo.commitTime(__dirname, '71f5fa4', function(err, time) {
        expect(time).to.equal('2013-12-27T05:38:34Z');
        done();
      });
    });

    it('should handle errors', function() {
      this.stub(childProcess, 'exec', function(exec, options, callback) {
        callback(new Error('It failed'));
      });

      var spy = this.spy();
      localInfo.commitTime(__dirname, 'asdf', spy);
      expect(spy.callCount).to.equal(1);
      expect(spy.calledWith(new Error('It failed'))).to.be.true;
    });
  });

  describe('#ensureClean', function() {
    it('should lookup local repo', function(done) {
      localInfo.ensureClean(__dirname, function(err, clean) {
        expect(clean).to.be.true;
        done();
      });
    });

    it('should handle dirty', function() {
      this.stub(childProcess, 'exec', function(exec, options, callback) {
        callback(undefined, ' ');
      });

      var spy = this.spy();
      localInfo.ensureClean(__dirname, spy);
      expect(spy.callCount).to.equal(1);
      expect(spy.calledWith(undefined, false)).to.be.true;
    });

    it('should handle errors', function() {
      this.stub(childProcess, 'exec', function(exec, options, callback) {
        callback(new Error('It failed'));
      });

      var spy = this.spy();
      localInfo.ensureClean(__dirname, spy);
      expect(spy.callCount).to.equal(1);
      expect(spy.calledWith(new Error('It failed'))).to.be.true;
    });
  });

  describe('#ensureFetched', function() {
    it('should handle fetched', function() {
      this.stub(childProcess, 'exec', function(exec, options, callback) {
        callback(undefined, '');
      });

      var spy = this.spy();
      localInfo.ensureFetched(__dirname, spy);
      expect(spy.callCount).to.equal(1);
      expect(spy.calledWith(undefined, true)).to.be.true;
    });

    it('should handle behind', function() {
      this.stub(childProcess, 'exec', function(exec, options, callback) {
        callback(undefined, '[behind 5]');
      });

      var spy = this.spy();
      localInfo.ensureFetched(__dirname, spy);
      expect(spy.callCount).to.equal(1);
      expect(spy.calledWith(undefined, false, {behind: '5'})).to.be.true;
    });

    it('should handle fetch errors', function() {
      this.stub(childProcess, 'exec', function(exec, options, callback) {
        callback(new Error('It failed'));
      });

      var spy = this.spy();
      localInfo.ensureFetched(__dirname, spy);
      expect(spy.callCount).to.equal(1);
      expect(spy.calledWith(new Error('It failed'))).to.be.true;
    });

    it('should handle branch errors', function() {
      this.stub(childProcess, 'exec', function(exec, options, callback) {
        callback(/branch/.test(exec) && new Error('It failed'));
      });

      var spy = this.spy();
      localInfo.ensureFetched(__dirname, spy);
      expect(spy.callCount).to.equal(1);
      expect(spy.calledWith(new Error('It failed'))).to.be.true;
    });
  });

  describe('#isSubmodule', function() {
    it('should return false for local dir', function(done) {
      localInfo.isSubmodule(path.resolve(__dirname + '/..'), function(err, isSubmodule) {
        expect(isSubmodule).to.be.false;
        done();
      });
    });

    it('should return true', function() {
      this.stub(childProcess, 'exec', function(exec, options, callback) {
        callback(undefined, 'true');
      });

      var spy = this.spy();
      localInfo.isSubmodule('/foo/bar', spy);

      expect(childProcess.exec.calledWith(sinon.match(/git rev-parse/), {cwd: '/foo'})).to.be.true;
      expect(spy.calledWith(undefined, true)).to.be.true;
    });

    it('should handle errors', function() {
      this.stub(childProcess, 'exec', function(exec, options, callback) {
        callback(new Error('It failed'));
      });

      var spy = this.spy();
      localInfo.isSubmodule('/foo/bar', spy);

      expect(spy.callCount).to.equal(1);
      expect(spy.calledWith(new Error('It failed'))).to.be.true;
    });
  });
});
