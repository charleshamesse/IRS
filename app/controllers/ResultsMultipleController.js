angular.module('app')
.controller('ResultsMultipleController', function($scope, $filter, ResultParser, FileWriter, FileParser) {
  // Globals
  $scope.ResultsMultiple = {
    "file": {},
    "scenarioExportType": "long"
  };
  require('svgtopng');
  fs = require('fs');
  var remote = require('remote');
  var mpath = require('path');
  var dialog = remote.require('dialog');

  $scope.ResultsMultiple.prepare = function () {
    // Get file
    $scope.ResultsMultiple.file = $scope.file;

    // Fetch all exploration output files
    angular.forEach($scope.file.content.content.explorations, function(e) {

      e.stdout = "";
      var output = fs.readFileSync(e.command.logFile, 'utf8');
      if(!output) return 0;
      e.stdout = output.trim();
      e.d3Data = ResultParser.parseFullExploration(e.stdout);
      e.d3TreeData = ResultParser.parseForTree(e.stdout);

      console.log(e);
    });

  };

  var getScenarioInfo = function(type) {
    var e = $scope.file.content.content.explorations[0],
        parameters = FileParser.parseParameterFile(e.command.parameterFile),
        candidates = FileParser.parseCandidateFile(e.command.candidatesFile)[1]
        parameterSelection = FileParser.parseParameterSelectionFile(e.command.selectionFile);
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
  };


    // Export to LaTex
    $scope.ResultsMultiple.exportToLatex = function() {
      // Make resource dir
      var options = {
        "title": "Output directory",
        "defaultPath": mpath.dirname($scope.file.path),
        "properties": ['openDirectory', 'createDirectory']
      },
          fpath = dialog.showOpenDialog(options)
          k = 0;

      if(fpath == null)
        return 0;

      fpath += mpath.sep;
      // Export plots, added name in the ID to avoid conflicts when several results editor are open
      angular.forEach($scope.file.content.content.explorations, function(e) {
        svgtopng.applyCssInline('linePlot-' + $scope.file.name + '-' + k);
        svgtopng.applyCssInline('treePlot-' + $scope.file.name + '-' + k);
        var linePlotBase64Data = svgtopng.getCanvasImg('linePlot-' + $scope.file.name + '-' + k).replace(/^data:image\/png;base64,/, "");
        var treePlotBase64Data = svgtopng.getCanvasImg('treePlot-' + $scope.file.name + '-' + k).replace(/^data:image\/png;base64,/, "");
        fs.writeFile(fpath + "line-plot-" + k + ".png", linePlotBase64Data, 'base64', function(err) {
          if(err) console.log(err);
        });
        fs.writeFile(fpath + "tree-plot-" + k + ".png", treePlotBase64Data, 'base64', function(err) {
          if(err) console.log(err);
        });
        e.plots = ["line-plot-" + k + ".png", "tree-plot-" + k + ".png"];
        ++k;
      });
      // Hand it to writer
      FileWriter.writeMultipleExplorationTeXFile(fpath, $scope.file.content.content.explorations, $scope.file.content.content.text, getScenarioInfo($scope.ResultsMultiple.scenarioExportType), true);
    }


});
