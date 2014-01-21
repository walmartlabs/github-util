var _ = require('underscore'),
    childProcess = require('child_process'),
    dateFormat = require('dateformat'),
    fs = require('fs'),
    path = require('path');

var STATUS_MAP = {
  'A': 'added',
  'M': 'modified',
  'D': 'deleted',
  'R': 'modified',
  'C': 'modified',
  '?': 'untracked',
  'U': 'modified'
};

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

  status: function(path, callback) {
    childProcess.exec('git status --porcelain', {cwd: path}, function(err, stdout) {
      if (err) {
        return callback(new Error('git.status ' + path + ': ' + err.message));
      }

      var lines = stdout.trim().split('\n'),
          counter = {added: 0, modified: 0, deleted: 0, untracked: 0};

      lines = _.filter(lines, function(line) { return line; });
      _.each(lines, function(line) {
        var index = STATUS_MAP[line[0]],
            workDir = STATUS_MAP[line[1]],
            status = [index, workDir].sort();

        if (status[0]) {
          counter[status[0]]++;
        }
      });

      callback(undefined, counter);
    });
  },

  unmergedBranches: function(dir, callback) {
    childProcess.exec('git branch --no-merged', {cwd: dir}, function(err, branches) {
      if (err) {
        if (/malformed object name HEAD/.test(err.message)) {
          // We are probably on a clean repo, ignore
          return callback(undefined, []);
        } else {
          return callback(new Error('git.unmerged: ' + dir + ' ' + err.message));
        }
      }

      branches = branches.trim().split(/\n/).map(function(branch) { return branch.trim(); });
      branches = _.filter(branches, function(branch) { return branch; });
      callback(undefined, branches);
    });
  },

  isSubmodule: function(dir, callback) {
    // If our parent is not a git directory then we are not a submodule.
    // This assumes that dir is the root of the git repo.
    childProcess.exec('git rev-parse --is-inside-work-tree', {cwd: path.dirname(dir)}, function(err, stdout) {
      callback(undefined, /true/.test(stdout));
    });
  }
};
