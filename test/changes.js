var chai = require('chai'),
      expect = chai.expect,
    changes = require('../lib/changes');

describe('changes', function() {
  describe('#latestVersion', function() {
    it('should find latest version', function() {
      var repo = {
        listTags: function(callback) {
          callback(undefined, [
            {name: 'v0.0.1'},
            {name: 'v0.1.0'},
            {name: 'v1.0.0'}
          ]);
        }
      };

      changes.latestVersion(repo, function(err, version) {
        expect(err).to.not.exist;
        expect(version).to.eql({name: 'v1.0.0'});
      });
    });
    it('should handle non-tagged repo', function() {
      var repo = {
        listTags: function(callback) {
          callback(undefined, []);
        }
      };

      changes.latestVersion(repo, function(err, version) {
        expect(err).to.not.exist;
        expect(version).to.not.exist;
      });
    });
    it('should handle api error', function() {
      var repo = {
        listTags: function(callback) {
          callback(new Error('it failed'));
        }
      };

      changes.latestVersion(repo, function(err, version) {
        expect(err).to.match(/it failed/);
      });
    });
  });
});
