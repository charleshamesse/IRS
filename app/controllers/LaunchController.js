angular.module('app')
.controller('LaunchController', function($scope, $filter, $timeout, FileWriter, Explorer, ResultParser) {
  // Globals
  $scope.Launch = {
    "isLaunched": false,
    "avalation": {},
    "irace": {},
    "fullexplore": {},
    "workDir": "",
    "irsDir": "irs-generated",
    "applicationSelected": false,
    "scenarioLoaded": false,
    "parameterSelection": [],
    "display": {
      "new": true,
      "export": false
    },
    "command": {
      "prefix": "Rscript explore.R",   // Done: constant
      "parameterFile": "",             // Done: rom scenario, as JSON
      "selectionFile": "",              // Done: in form
      "candidatesFile": "",            // Done: from scenario, as JSON
      "logFile": "",                   // Done: determined with workDir in makeCommand
      "instanceFile": "",              // Done: from scenario, as uri string
      "hookRun": "",                   // Done: from scenario
      "parallel": "2",                 // Done: in form
      "type": "select",                // Done: in form
      "preview": ""                    // Done: computed from all other values
    }
  };
  $scope.Launch.parameterTypes = {
      "i": {
        "name": "integer",
        "value": "i"
      },
      "r": {
        "name": "real",
        "value": "r"
      },
      "c": {
        "name": "categorical",
        "value": "c"
      },
      "o": {
        "name": "order",
        "value": "o"
      }
  };

  $scope.Launch.workDir = $scope.file.path.substring(0, $scope.file.path.lastIndexOf("/") + 1);
  $scope.Launch.prepare = function() {
    if($scope.Launch.file.content.content.scenario_uri) {
      loadScenario($scope.Launch.file.content.content.scenario_uri);
    }
  };
  // History log
  var log = function(message, more) {
    $scope.Launch.file.content.content.history.unshift({
      "date": new Date(),
      "text": message,
      "more": more
    });
  }

  // Dependencies
  var fs = require('fs');
  var remote = require('remote');
  var mpath = require('path');
  var dialog = remote.require('dialog');

  // Open candidates dialog and load scenario
  $scope.Launch.openScenario = function() {
    dialog.showOpenDialog(function(path) {
      loadScenario(path[0]);
    });
  };

  function loadScenario(path) {
    fs.readFile(path, 'utf8', function(err, data) {
      if (err) dialog.showMessageBox('Error', 'Unable to open file: ' + path + '\n' + err);
      else {
        // 1. Check if file is .ir
        var ext = path.split(".").pop();
        if(ext != "ir") {
          alert('This is not a valid scenario file.');
          return 0;
        }

        // 2. Check if file contains all required scenario features
        $scope.Launch.scenario = angular.fromJson(data);
        $scope.Launch.scenario.content.parameters.forEach(function(p) {
          p.selected = true;
          $scope.Launch.parameterSelection.push(p);
        });

        // 3. Fill object
        $scope.Launch.file.content.content.scenario_uri = path;
        $scope.Launch.command.hookRun = $scope.Launch.scenario.content.hookrun_uri;
        $scope.Launch.command.instanceFile = $scope.Launch.scenario.content.instances.training_uri;

        // 4. Apply
        $scope.Launch.scenarioLoaded = true;
        $scope.$apply();

        // 5. Log
        log("Loaded scenario " + mpath.basename($scope.Launch.file.content.content.scenario_uri), "Complete scenario path: " + $scope.Launch.file.content.content.scenario_uri);
      }
    });
  }
  $scope.Launch.reloadScenario = function() {
    $scope.Launch.scenario = {};
    $scope.Launch.parameterSelection = [];
    loadScenario($scope.Launch.file.content.content.scenario_uri);
  }

  // Parameters
  $scope.Launch.viewParameter = function(p) {
    $scope.Launch.hoverParameter = p;
  };
  // Launch exploration
  $scope.Launch.makeCommand = function(d) {
      var irsDir = $scope.Launch.workDir + $scope.Launch.irsDir + "/";
      $scope.Launch.command.preview = $scope.Launch.command.prefix + " "
      + " --parameter-file " + irsDir + "parameters-" + d + ".txt"
      + " --sel-parameter-file " + irsDir + "selection-" + d + ".txt"
      + " --candidates-file " + irsDir + "candidates-" + d + ".txt"
      + " --log-file " + irsDir + "irs-log"
      + " --instance-file " + $scope.Launch.scenario.content.instances.testing_uri
      + " --hook-run " + $scope.Launch.scenario.content.hookrun_uri
      + " --parallel " + $scope.Launch.command.parallel
      + " --type " + $scope.Launch.command.type;
  }
  $scope.Launch.launchExploration = function() {

    // Globals and dependencies
    var exec = require('child_process').exec;
    $scope.Launch.result = "";
    var d = new Date().toISOString();

    // TO-DO: Check candidate number: FE	1 candidate, n parameters, A	2 candidates, n parameters, I	n candidates, n parameters

    // Generate text file
    var resourcesDir = $scope.Launch.workDir + "irs-generated/",
        parameterSelection = $filter('filter')($scope.Launch.scenario.content.parameters, {selected: true}, true),
        candidateSelection = [],
        parameterFile = resourcesDir + "parameters-" + d + ".txt",
        selectionFile = resourcesDir + "selection-" + d + ".txt",
        candidatesFile = resourcesDir + "candidates-" + d + ".txt",
        logFile = resourcesDir + "log-" + d;

    switch($scope.Launch.command.type) {
      case 'ablation':
        candidateSelection = $filter('filter')($scope.Launch.scenario.content.candidates.candidates, {selected: true}, true);
        break;
      case 'full':
        candidateSelection[0] =  $scope.Launch.scenario.content.candidates.candidates[$scope.Launch.selectedCandidate];
    }
    FileWriter.makeResourcesDir(resourcesDir);
    FileWriter.writeParameterFile(parameterFile, $scope.Launch.scenario.content.parameters);
    FileWriter.writeSelectionFile(selectionFile, parameterSelection);
    FileWriter.writeCandidatesFile(candidatesFile, candidateSelection, $scope.Launch.scenario.content.candidates.parameters);

    // Preview command
    $scope.Launch.command.parameterFile = parameterFile;
    $scope.Launch.command.selectionFile = selectionFile;
    $scope.Launch.command.candidatesFile = candidatesFile;
    $scope.Launch.command.logFile = logFile;
    $scope.Launch.makeCommand(d);
    Explorer.launch($scope.Launch.command);

    // Extend the string prototype - to refactor
    String.prototype.beginsWith = function (string) {
      return(this.indexOf(string) === 0);
    };

    var updateResult = function(){
      var temp = Explorer.output(),
          lines = temp.split('\n'),
          output = "";
      // Terminal line coloring
      lines.forEach(function(l) {
        if(l.beginsWith('#')) {
          l = '<span class="text-success">' + l + '</span>';
        }
        else if(l.beginsWith('Warning') || l.beginsWith('WARNING')) {
          l = '<span class="text-warning">' + l + '</span>';
        }
        output += l + '\n';
      });

      $scope.Launch.result = output.replace(/(?:\r\n|\r|\n)/g, '<br>');;
      $scope.$apply();
    };

    Explorer.registerObserverCallback(updateResult);

    $scope.Launch.isLaunched = true;

    // Log and add to exp list
    log("Launched an exploration using " + $scope.Launch.command.type, "Command preview: " + $scope.Launch.command.preview);
    $scope.Launch.file.content.content.explorations.push({
      "name": $scope.Launch.explorationName,
      "date": d,
      "dir": resourcesDir
    });

  }

  $scope.Launch.export = function() {
    console.log($scope.Launch.file);
    var options = {
      "defaultPath": mpath.dirname($scope.Launch.file.path),
      "properties": ['openFile', 'createDirectory'],
      "filters": [{ name: 'IR Studio files', extensions: ['ir'] }]
    };
    var fpath = dialog.showSaveDialog(options);

    if(fpath != null) {
      FileWriter.writeSingleExport(fpath, Explorer.output(), $scope.Launch.command.type);
    }
  }


});
