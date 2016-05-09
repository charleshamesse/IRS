angular.module('app')
.controller('ResultsController', function($scope, $filter, ResultParser, FileWriter, FileParser) {
  // Globals
  $scope.Results = {
    "file": $scope.file,
    "scenarioExportType": "long"
  };
  require('svgtopng');
  var remote = require('remote');
  var mpath = require('path');
  var dialog = remote.require('dialog');
  var fs = require("fs");
  var stdout = "";

  $scope.Results.prepare = function() {
    $scope.Results.file = $scope.file;
    var outputLines = $scope.Results.file.content.content.stdout;
    angular.forEach(outputLines, function(line) {
      stdout += line.trim() + '\n';
    });
    stdout.slice(0,-2);
    stdout = stdout.trim();
    makePlots(stdout);
  }

  var makePlots = function(stdout) {
    $scope.d3Data = ResultParser.parseFullExploration(stdout);
    $scope.d3TreeData = ResultParser.parseForTree(stdout);
  }

  var getScenarioInfo = function(type) {
    var parameters = FileParser.parseParameterFile($scope.Results.file.content.content.command.parameterFile),
        candidates = FileParser.parseCandidateFile($scope.Results.file.content.content.command.candidatesFile)[1]
        parameterSelection = FileParser.parseParameterSelectionFile($scope.Results.file.content.content.command.selectionFile);
    var ret = {
      "type": type,
      "parameters": {
        "list": parameters,
        "numbers": {
          "i": $filter('filter')(parameters, {type: 'i'}, true).length,
          "c": $filter('filter')(parameters, {type: 'c'}, true).length,
          "r": $filter('filter')(parameters, {type: 'r'}, true).length,
          "o": $filter('filter')(parameters, {type: 'o'}, true).length
        }
      },
      "candidates": candidates,
      "parameterSelection": parameterSelection
    };
    return ret;
  }


  // Export to LaTex
  $scope.Results.exportToLatex = function() {
    // Make resource dir
    var options = {
      "title": "Output directory",
      "defaultPath": mpath.dirname($scope.Results.file.path),
      "properties": ['openDirectory', 'createDirectory']
    };
    var fpath = dialog.showOpenDialog(options);

    if(fpath == null)
      return 0;

    fpath += mpath.sep;
    // Export plots, added name in the ID to avoid conflicts when several results editor are open
    svgtopng.applyCssInline('linePlot-' + $scope.Results.file.name);
    svgtopng.applyCssInline('treePlot-' + $scope.Results.file.name);
    var linePlotBase64Data = svgtopng.getCanvasImg('linePlot-' + $scope.Results.file.name).replace(/^data:image\/png;base64,/, "");
    var treePlotBase64Data = svgtopng.getCanvasImg('treePlot-' + $scope.Results.file.name).replace(/^data:image\/png;base64,/, "");
    fs.writeFile(fpath + "line-plot.png", linePlotBase64Data, 'base64', function(err) {
      console.log(err);
    });
    fs.writeFile(fpath + "tree-plot.png", treePlotBase64Data, 'base64', function(err) {
      console.log(err);
    });
    // Hand it to writer
    FileWriter.writeSingleExplorationTeXFile(fpath, $scope.Results.file.content.content.text, $scope.Results.file.content.content.dates, $scope.Results.file.content.content.command, getScenarioInfo($scope.Results.scenarioExportType), ["line-plot.png", "tree-plot.png"], true);
  };
});
