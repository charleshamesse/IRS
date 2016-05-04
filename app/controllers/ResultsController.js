angular.module('app')
.controller('ResultsController', function($scope, ResultParser, FileWriter) {
  // Globals
  $scope.Results = {
    "file": $scope.file
  };
  require('svgtopng');
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


  // Export to LaTex
  $scope.Results.exportToLatex = function() {
    // Make resource dir
    FileWriter.makeResourcesDir("../../irs-export");
    // Export plots
    svgtopng.applyCssInline('linePlot');
    svgtopng.applyCssInline('treePlot');
    var base64Data = svgtopng.getCanvasImg('linePlot').replace(/^data:image\/png;base64,/, "");
    var base64Data2 = svgtopng.getCanvasImg('treePlot').replace(/^data:image\/png;base64,/, "");
    require("fs").writeFile("../../irs-export/out.png", base64Data, 'base64', function(err) {
      console.log(err);
    });
    require("fs").writeFile("../../irs-export/out2.png", base64Data2, 'base64', function(err) {
      console.log(err);
    });
    // Export text
    console.log($scope.Results.file.content.content.text);
    // Hand it to writer
    FileWriter.writeTeXFile("../../irs-export/", $scope.Results.file.content.content.text, ["out.png", "out2.png"], "../../irs-export/", true);
  }
});
