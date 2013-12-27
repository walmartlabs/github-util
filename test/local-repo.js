var chai = require('chai'),
      expect = chai.expect,
    childProcess = require('child_process'),
    repoState = require('../lib/repo-state'),
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
      repoState.githubName(function(err, origin) {
        expect(origin).to.equal('walmartlabs/github-util');
        done();
      });
    });

    it('should select origin for multiple instances', function() {
      this.stub(childProcess, 'exec', function(exec, callback) {
        callback(undefined,
          'origin  git@github.com:kpdecker/github-util.git (fetch)\n'
          + 'origin  git@github.com:kpdecker/github-util.git (push)\n'
          + 'upstream  git@github.com:walmartlabs/github-util.git (fetch)\n'
          + 'upstream  git@github.com:walmartlabs/github-util.git (push)\n');
      });
      repoState.githubName(function(err, origin) {
        expect(origin).to.equal('kpdecker/github-util');
      });
    });

    it('should handle errors', function() {
      this.stub(childProcess, 'exec', function(exec, callback) {
        callback(new Error('It failed'));
      });

      var spy = this.spy();
      repoState.githubName(spy);
      expect(spy.callCount).to.equal(1);
      expect(spy.calledWith(new Error('It failed'))).to.be.true;
    });
  });

  describe('#firstCommit', function() {
    it('should lookup local repo', function(done) {
      repoState.firstCommit(function(err, first) {
        expect(first).to.equal('71f5fa4');
        done();
      });
    });

    it('should handle errors', function() {
      this.stub(childProcess, 'exec', function(exec, callback) {
        callback(new Error('It failed'));
      });

      var spy = this.spy();
      repoState.firstCommit(spy);
      expect(spy.callCount).to.equal(1);
      expect(spy.calledWith(new Error('It failed'))).to.be.true;
    });
  });

  describe('#commitTime', function() {
    it('should lookup local repo', function(done) {
      repoState.commitTime('71f5fa4', function(err, time) {
        expect(time).to.equal('2013-12-27T05:38:34Z');
        done();
      });
    });

    it('should handle errors', function() {
      this.stub(childProcess, 'exec', function(exec, callback) {
        callback(new Error('It failed'));
      });

      var spy = this.spy();
      repoState.commitTime('asdf', spy);
      expect(spy.callCount).to.equal(1);
      expect(spy.calledWith(new Error('It failed'))).to.be.true;
    });
  });
});
