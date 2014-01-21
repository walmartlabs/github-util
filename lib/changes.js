var _ = require('underscore'),
    semver = require('semver');

module.exports = {
  latestVersion: function(repo, callback) {
    repo.listTags(function(err, tags) {
      var versions = _.filter(tags || [], function(tag) { return /^v/.test(tag.name); });
      versions = versions.sort(function(a, b) {
        if (!semver.valid(a.name)) {
          return 1;
        } else if (!semver.valid(b.name)) {
          return -1;
        } else {
          return semver.gt(a.name, b.name) ? -1 : 1;
        }
      });

      callback(err, versions[0]);
    });
  }
};
