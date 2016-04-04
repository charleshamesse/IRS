angular.module('app')
.controller('SetupController', function($scope) {
  // Global
  $scope.Setup = {
    "history": [],
    "display": {
      "hookrun": true,
      "instances": true,
      "parameters": true,
      "candidates": true,
      "history": true
    }
  };

  // Dependencies
  var fs = require('fs');
  var remote = require('remote');
  var dialog = remote.require('dialog');
  const BrowserWindow = remote.require('browser-window');


  //
  // Hook-run
  //
  // Open hook-run dialog
  $scope.Setup.openHookRun = function() {
    dialog.showOpenDialog(function(path) {
      $scope.Setup.file.content.content.hookrun_uri = path[0];
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
                'info': 'Source: "' + path + '".'
              });
              ++count;
            }
          }
        });
        console.log(candidates);
        console.log(parameters);
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
              'info': 'Candidate source'
            };
            i++;
            count++;
          });

          // Add history record
          $scope.Setup.history.push({
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
    $scope.Setup.file.content.content.candidates.candidates.splice(id,1);
    $scope.Setup.history.push({
      'action': 'Removed candidate ' + (id+1),
      'detail': 'Candidate name',
      'date': new Date()
    });
  };

  // Select all candidates
  $scope.Setup.selectAll = function() {
    $scope.Setup.file.content.content.candidates.candidates.forEach(function(candidate) {
      candidate.selected = $scope.Setup.allSelected;
    });
  }
  //
  // Parameters
  //

  $scope.importParameters = function() {
    dialog.showOpenDialog(function(f) {
      scanParameters(f[0]);
    });
  };

  function scanParameters(filename) {
    var params = [];
    fs.readFile(filename, 'utf8', function(err, data) {
      if (err) {
        throw err;
        console.log(err);
      }
      var lines = data.trim().split('\n');
      lines.forEach(function(l) {
        if(l[0] != '#' && l != "") {
          var p = {};
          var line = l.substring(0, l.indexOf('"'));
          p.name = line.trim();
          var line2 = l.substring(l.indexOf('"')+1);
          p.switch = line2.substring(0, line2.indexOf('"'));
          var line3 = line2.substring(line2.indexOf('"')+1).trim();
          p.type = line3[0];
          p.values = line3.slice(1).substring(0, line3.indexOf(")")).trim();
          var line4 = line3.slice(line3.indexOf(")")+1).trim();
          p.conditions = line4.slice(line4.indexOf("|")+2);
          console.log(line);
          params.push(p);
        }
      });
      $scope.Setup.file.content.content.parameters = params;
      $scope.$apply();
    });
  }

  $scope.Setup.parameters = {
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
    fs.readFile(path, 'utf8', function(err, data) {
      if (err) dialog.showMessageBox('Error', 'Unable to open file: ' + path + '\n' + err);
      else {

        // Read
        var lines = data.split('\n');
        var instances_temp = [];
        lines.forEach(function(line) {
          if(line[0] != "#") instances_temp.push(line);
        });

        // Fill corresponding array
        var action = 'Selected ';
        if(type == 0) {
          //$scope.Setup.file.content.content.instances.testing = instances_temp;
          $scope.Setup.file.content.content.instances.testing_uri = path;
          action += $scope.Setup.file.content.content.instances.testing.length + ' testing instances';
        }
        else {
          //$scope.Setup.file.content.content.instances.training = instances_temp;
          $scope.Setup.file.content.content.instances.training_uri = path;
          action += $scope.Setup.file.content.content.instances.training.length + ' training instances';
        }

        // Add history record
        $scope.Setup.history.push({
          'action': action,
          'detail': '',
          'date': new Date()
        });

        $scope.$apply();
      }
    });
  }
});
