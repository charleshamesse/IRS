angular.module('app')
.controller('LaunchController', function($scope, FileWriter, ResultParser) {
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
      + " --type " + $scope.Launch.command.type
    console.log($scope.Launch.command.preview);
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
          $mdToast.show($mdToast.simple({position: 'bottom'}).content('This is not a valid scenario file.'));
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

    // Generate text file
    var resourcesDir = $scope.Launch.workDir + "irs-generated/";
    FileWriter.makeResourcesDir(resourcesDir);
    FileWriter.writeParameterFile(resourcesDir + "/parameters.txt", {});
    FileWriter.writeSelectionFile(resourcesDir + "selection.txt", ["algorithm", "localsearch"]);
    FileWriter.writeCandidatesFile(resourcesDir + "candidates.txt", $scope.Launch.scenario.content.candidates);


    // Preview command
    $scope.Launch.makeCommand();

    // Treat each case
    switch($scope.Launch.command.type) {
      case 'ablation':
      break;
      case 'full':
      break;
      case 'irace':
      break;
    }

    // Execute command
    exec('pwd', function(error, stdout, stderr) {
      if (error !== null) {
        console.log('exec error: ' + error);
        return 0;
      }

      // Mocking up the data
      stdout = `Initial 16663
localsearch=3,nnls=40,dlb=1 13390
alpha=1 5402.33333333333
beta=2 12242
algorithm=mmas 12263.6666666667
rho=0.2 3464.66666666667
ants=25 13753.3333333333`;

      // Display output
      $scope.Launch.result = ResultParser.parseFullExploration(stdout);
      $scope.Launch.isLaunched = true;
      $scope.$apply();
    });


  }


});
