'use strict';

angular.module('app')
.service('ResultParser', function () {
  var result = {};

  this.parseIrace = function(stdout) {
    result.topline = "Hi! Here's your result";
    result.stdout = stdout;
    result.bottomline = "Done. :)";
    return result;
  };

  this.parseFullExploration = function(stdout) {
    result.topline = "Full Exploration results";

    var lines = stdout.match(/[^\r\n]+/g);
    result.plotData = [];
    result.lines = lines;
    lines.forEach(function(l) {
      var kvPair = l.split(" ");
      var pair = {
        "x": kvPair[0],
        "y": parseFloat(kvPair[1])
      };
      result.plotData.push(pair);
    });

    result.bottomline = "Done. :)";
    return result;
  };

  this.parseAblation = function(stdout) {
    result.topline = "Hi! Here's your result";
    result.stdout = stdout;
    result.bottomline = "Done. :)";
    return result;
  };

});
