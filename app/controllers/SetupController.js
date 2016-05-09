angular.module('app')
.controller('SetupController', function($scope, FileParser) {
  // Dependencies
  var fs = require('fs');
  var remote = require('remote');
  var fpath = require("path");
  var dialog = remote.require('dialog');
  require('svgtopng');
  const BrowserWindow = remote.require('browser-window');

  // Global
  $scope.Setup = {
    "parameterLock": true,
    "display": {
      "hookrun": true,
      "instances": true,
      "parameters": true,
      "candidates": true,
      "history": true
    },
    "displayParameterTree": false,
    "parameterTreeData" : [{
      "name": "Origin",
      "children": [],
      "parent": null,
      "score": 10000
    }],
    "parameters": {
      "categories": {
        "i": {
          "name": "Integer",
          "value": "i"
        },
        "r": {
          "name": "Real",
          "value": "r"
        },
        "c": {
          "name": "Categorical",
          "value": "c"
        },
        "o": {
          "name": "Order",
          "value": "o"
        }
      }
    }
  };

  // History log
  var log = function(message) {
    $scope.Setup.file.content.content.history.unshift({
      "date": new Date(),
      "text": message
    });
  }

  //
  // Hook-run
  //
  // Open hook-run dialog
  $scope.Setup.openHookRun = function() {
    dialog.showOpenDialog(function(path) {
      $scope.Setup.file.content.content.hookrun_uri = path[0];
      log("Imported hook-run method from " + fpath.basename(path[0]) + "");
      $scope.$apply();
    });
  };

  //
  // Candidates
  //
  // Open candidates dialog
  $scope.Setup.openCandidates = function() {
    dialog.showOpenDialog(function(path) {
      loadCandidates(path[0]);
    });
  };

  // Once dialog is closed, load candidates from file
  function loadCandidates(path) {
    fs.readFile(path, 'utf8', function(err, data) {
      if (err) dialog.showMessageBox('Error', 'Unable to open file: ' + path + '\n' + err);
      else {
        // Parse candidate file
        var lines = data.trim().split('\n'),
        count = 0,
        parameters = [],
        candidates = [],
        values = [];
        lines.forEach(function(l) {
          if(l[0] != '#' && l != "") {
            // Parameter list
            if(count == 0) {
              parameters = l.match(/\S+/g);
              ++count;
            }
            else {
              candidates.push({
                'label': "Candidate " + count,
                'values': l.match(/\S+/g),
                'develop': false,
                'info': 'Source: "' + path + '".',
                'lock': true
              });
              ++count;
            }
          }
        });
        $scope.Setup.file.content.content.candidates.parameters = parameters;
        $scope.Setup.file.content.content.candidates.candidates = $scope.Setup.file.content.content.candidates.candidates.concat(candidates);


        // If .ir
        if(false) {
          data = angular.fromJson(data);

          // Get the parameters
          $scope.Setup.file.content.content.candidates.candidates_parameters = data.parameters;
          var i = $scope.Setup.file.content.content.candidates.candidates.length | 0;
          var count = 0;

          // For each candidate, format it and add it to the list
          data.candidates.forEach(function(candidate) {
            $scope.Setup.file.content.content.candidates.candidates[i] = {
              'label': candidate.label,
              'values': candidate.values,
              'develop': false,
              'info': 'Candidate source',
              'lock': true
            };
            i++;
            count++;
          });

          // Add history record
          $scope.Setup.file.content.content.history.push({
            'action': 'Imported ' + (count) + ' candidates',
            'detail': '',
            'date': new Date()
          });

          $scope.$apply();
        }
      }
    });
  }

  // Delete a candidate
  $scope.Setup.deleteCandidate = function(id) {
    log("Removed candidate " + $scope.Setup.file.content.content.candidates.candidates[id].label);
    $scope.Setup.file.content.content.candidates.candidates.splice(id,1);
  };

  // Select all candidates
  $scope.Setup.selectAll = function() {
    $scope.Setup.file.content.content.candidates.candidates.forEach(function(candidate) {
      candidate.selected = $scope.Setup.allSelected;
    });
  }

  // Notify candidate change
  $scope.Setup.notifyCandidateChange = function(c) {
    console.log("hi");
    log("Edited candidate " + c.label);
  };

  // New candidate
  $scope.Setup.newCandidate = function() {
    $scope.Setup.file.content.content.candidates.candidates.unshift({});
    log("Created new candidate");
  };

  //
  // Parameters
  //
  $scope.Setup.importParameters = function() {
    dialog.showOpenDialog(function(f) {
      $scope.Setup.file.content.content.parameters = FileParser.parseParameterFile(f[0]);
      $scope.$apply();
    });
  };

  // Notify parameter change
  $scope.Setup.notifyParameterChange = function(parameter) {
    log("Edited parameter " + parameter.name);
  };

  // Dependency tree
  $scope.Setup.plotDepencyTree = function() {
    // Reinit
    $scope.Setup.parameterTreeData[0].children = [];
    // Maybe deep-copy it instead?
    var parameters = $scope.Setup.file.content.content.parameters;
    angular.forEach(parameters, function(p1) {
      p1.children = [];
      p1.score = 10000;
    });
    angular.forEach(parameters, function(p1) {
      var hasDependencies = false;
      angular.forEach(parameters, function(p2) {
        // Look in p1 conditions if there exists occurences of p2
        // If p1 has dependencies
        var re = new RegExp("\\b" + p2.name, 'g'); //" +p2.name
        var match = p1.conditions.match(re);
        if(match != null) {
          hasDependencies = true;
          p2.children.push(p1);
          p1.parentName = p2.name;
        }
      });
      if(!hasDependencies)
      $scope.Setup.parameterTreeData[0].children.push(p1);
    });
  };

  //
  // Instances
  //
  // Open instances dialog
  $scope.Setup.openInstances = function(type) {
    dialog.showOpenDialog(function(path) {
      loadInstances(path[0], type);
    });
  };

  // Once dialog is closed, load instances from file
  function loadInstances(path, type) {
    // Fill corresponding array
    var action = 'Imported ';
    if(type == 1) {
      $scope.Setup.file.content.content.instances.testing_uri = path;
      action += ' testing instances from ' + fpath.basename(path);
    }
    else if(type == 0) {
      $scope.Setup.file.content.content.instances.training_uri = path;
      action += ' training instances from ' + fpath.basename(path);
    }
    // Add history record
    log(action);
    $scope.$apply();
  }
});
