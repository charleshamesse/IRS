angular.module('app')
.controller('ResultsController', function($scope, ResultParser) {
  // Globals
  $scope.Results = {};

  var stdout = `Initial 16663
localsearch=3,nnls=40,dlb=1 13390
alpha=1 5402
beta=2 12242
algorithm=mmas 12263
rho=0.2 3467
ants=25 13753`;

  // Display output
  $scope.Results.parse = ResultParser.parseFullExploration(stdout);

  $scope.d3Data = $scope.Results.parse.plotData;
  $scope.d3Data2 =  [{
    "sale": "2",
    "year": "2000"
  }, {
    "sale": "115",
    "year": "2002"
  }, {
    "sale": "79",
    "year": "2004"
  }, {
    "sale": "19",
    "year": "2006"
  }, {
    "sale": "54",
    "year": "2008"
  }, {
    "sale": "176",
    "year": "2010"
  }];

});
