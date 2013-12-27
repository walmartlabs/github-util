var _ = require('underscore'),
    childProcess = require('child_process'),
    dateFormat = require('dateformat'),
    fs = require('fs'),
    path = require('path');

module.exports = {
  githubName: function(dir, callback) {
    childProcess.exec('git remote -v', {cwd: dir}, function(err, stdout, stderr) {
      if (err) {
        return callback(err);
      }

      var matcher = /(.+)\s+.*github.com[:\/]?(.*)\.git/g,
          repos = {};
      while (matcher.exec(stdout)) {
        var remoteName = RegExp.$1,
            repoName = RegExp.$2;
        repos[remoteName] = repoName;
      }
      callback(undefined, repos.origin || _.values(repos)[0]);
    });
  },
  firstCommit: function(dir, callback) {
    childProcess.exec('git rev-list HEAD --max-parents=0 --abbrev-commit', {cwd: dir}, function(err, stdout, stderr) {
      if (err) {
        return callback(err);
      }

      callback(undefined, stdout.split('\n')[0]);
    });
  },

  commitTime: function(dir, sha, callback) {
    childProcess.exec('git show ' + sha, {cwd: dir}, function(err, stdout, stderr) {
      var time;
      if (!err && /Date:\s*(.*)/.exec(stdout)) {
        time = dateFormat(new Date(RegExp.$1), 'isoUtcDateTime');
      }
      callback(err, time);
    });
  },

  ensureClean: function(dir, callback) {
    childProcess.exec('git diff-index --name-only HEAD --', {cwd: dir}, function(err, stdout, stderr) {
      callback(err, !err && !stdout.length);
    });
  },

  ensureFetched: function(dir, callback) {
    childProcess.exec('git fetch', {cwd: dir}, function(err, stdout, stderr) {
      if (err) {
        return callback(err);
      }

      childProcess.exec('git branch -v --no-color | grep -e "^\\*"', {cwd: dir}, function(err, stdout, stderr) {
        if (err) {
          callback(err);
        } else if (/\[behind (.*)\]/.test(stdout)) {
          callback(undefined, false, {behind: RegExp.$1});
        } else {
          callback(undefined, true);
        }
      });
    });
  },

  isSubmodule: function(dir, callback) {
    // If our parent is not a git directory then we are not a submodule.
    // This assumes that dir is the root of the git repo.
    childProcess.exec('git rev-parse --is-inside-work-tree', {cwd: path.dirname(dir)}, function(err, stdout) {
      callback(err, /true/.test(stdout));
    });
  }
};
