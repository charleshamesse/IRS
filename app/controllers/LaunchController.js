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
    "parameterSelection": [],
    "command": {
      "prefix": "Rscript explore.R",   // Done: constant
      "parameter-file": "",            // from scenario, as JSON
      "selParamFile": "",              // in form
      "candidatesFile": "",            // Done: from scenario, as JSON
      "logFile": "",                   // Done: determined with workDir in makeCommand
      "instanceFile": "",              // Done: from scenario, as uri string
      "hookRun": "",                   // Done: from scenario
      "parallel": "2",                 // Done: in form
      "type": "select",                // Done: in form
      "preview": ""                    // Done: computed from all other values
    }
  };
  $scope.Launch.workDir = $scope.file.path.substring(0, $scope.file.path.lastIndexOf("/") + 1);


  $scope.Launch.makeCommand = function() {
    var irsDir = $scope.Launch.workDir + $scope.Launch.irsDir + "/";
    $scope.Launch.command.preview = $scope.Launch.command.prefix + " "
    + " --parameter-file " + irsDir + "parameters.txt"
    + " --sel-parameter-file " + irsDir + "selection.txt"
    + " --candidates-file " + irsDir + "candidates.txt"
    + " --log-file " + irsDir + "irs-log"
    + " --instance-file " + $scope.Launch.scenario.content.instances.testing_uri
    + " --hook-run " + $scope.Launch.scenario.content.hookrun_uri
    + " --parallel " + $scope.Launch.command.parallel
    + " --type " + $scope.Launch.command.type;
  }

  // Dependencies
  var fs = require('fs');
  var remote = require('remote');
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
        $scope.Launch.scenario.content.candidates.parameters.forEach(function(p) {
          $scope.Launch.parameterSelection.push({
            "name": p,
            "selected": true
          })
        });

        // 3. Fill object
        $scope.Launch.file.content.content.scenario_uri = path;
        $scope.Launch.scenario_uri = path;

        // 4. Apply
        $scope.$apply();
      }
    });
  }

  // Launch exploration
  $scope.Launch.launchExploration = function() {

    // Globals and dependencies
    var exec = require('child_process').exec;

    // Check candidate number
    /*
    FE	1 candidate
    n parameters
    A	2 candidates
    n parameters
    I	n candidates
    n parameters
    */
    // Generate text file
    var resourcesDir = $scope.Launch.workDir + "irs-generated/",
    parameterSelection = $filter('filter')($scope.Launch.parameterSelection, {selected: true}, true);
    FileWriter.makeResourcesDir(resourcesDir);
    FileWriter.writeParameterFile(resourcesDir + "parameters.txt", $scope.Launch.scenario.content.parameters);
    FileWriter.writeSelectionFile(resourcesDir + "selection.txt", parameterSelection);
    FileWriter.writeCandidatesFile(resourcesDir + "candidates.txt", $scope.Launch.scenario.content.candidates);


    // Preview command
    $scope.Launch.makeCommand();
    Explorer.launch($scope.Launch.command);

    // Extend the string prototype - refactor
    String.prototype.beginsWith = function (string) {
      return(this.indexOf(string) === 0);
    };

    var updateResult = function(){
      var temp = Explorer.output(),
          lines = temp.split('\n'),
          output = "";
      lines.forEach(function(l) {
        if(l.beginsWith('#')) {
          l = '<span class="text-muted">' + l + '</span>';
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

    // ResultParser.parseFullExploration(stdout2);
    $scope.Launch.isLaunched = true;


  }


});
