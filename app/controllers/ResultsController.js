angular.module('app')
.controller('ResultsController', function($scope, ResultParser, FileWriter) {
  // Globals
  $scope.Results = {
    "file": $scope.file
  };
  require('./assets/js/svgtopng');

  svgtopng.test('hah');

  var stdout = `Initial 28915.67
algorithm=mmas 31641.6666666667
algorithm=eas,elitistants=732.23 1599.66666666667
algorithm=ras,rasrank=4.01 4325.33333333333
algorithm=acs,q0=0.26 7051.33333333333
localsearch=1,nnls=26.84,dlb=0 9777
localsearch=2,nnls=11.5,dlb=1 12503
localsearch=3,nnls=25.61,dlb=0 15228.6666666667
alpha=0.45 17954.6666666667
alpha=1.51 20680.3333333333
alpha=2.06 23406.3333333333
alpha=3.12 26132
alpha=3.57 28858
beta=0.21 31583.6666666667
beta=3.05 1541.66666666667
beta=3.82 4267.33333333333
beta=5.87 6993.33333333333
beta=7.09 9719.33333333333
rho=0.05 12445
rho=0.3 15170.6666666667
rho=0.41 17896.6666666667
rho=0.55 20622.3333333333
rho=0.69 23348.3333333333
ants=15.86 26074.3333333333
ants=25.39 28800
ants=50.89 31525.6666666667
ants=55.85 1483.66666666667
ants=70.85 4209.66666666667`;

  // Display output
  $scope.Results.parse = ResultParser.parseFullExploration(stdout);

  $scope.d3Data = $scope.Results.parse.plotData;
  $scope.d3TreeData = ResultParser.parseForTree(stdout);

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

  $scope.Results.printSVGData = function() {
    /*
    var linePlot = angular.element( document.querySelector( '#linePlot' ) ).html();
    console.log(linePlot);
    var treePlot = angular.element( document.querySelector( '#treePlot' ) ).html();
    console.log(treePlot);
    console.log(btoa(linePlot));
    */
  }
});
