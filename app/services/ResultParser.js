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

  this.parseForTree = function(stdout) {
    var lines = stdout.split('\n'),
        treeData = [{
          "name": "Initial",
          "parent": "null",
          "score": 24269,
          "children": []
        }],
        currentParameter = "",
        groups = [],
        count = 0;

    lines.forEach(function(l) {
      l = l.trim();
      if(count != 0) {
      var kv = l.split(' '),
          name = kv[0],
          score = kv[1],
          parameter = name.split('=')[0];

      if(currentParameter != parameter) {
        groups.push({
          "parameter": parameter,
          "values": [{"name": name, "score": score}]
        });
      }
      else {
        groups[groups.length-1].values.push({"name": name, "score": score});
      }
      currentParameter = parameter;
      }
      ++count;
    });

    var appendChildren = function(parent, groups, level) {

      // Find max
      var max = 0,
          maxIdx = 0,
          currentIdx = 0;

      groups[level].values.forEach(function(l) {
        if(max < parseFloat(l.score)) {
          maxIdx = currentIdx;
          max = parseFloat(l.score);
        }
        ++currentIdx;
      });

      // Append children
      groups[level].values.forEach(function(l) {
        parent.children.push({
          "name": l.name,
          "parent": parent.name,
          "score": l.score,
          "children": []
        });
      });

      // Append grand children
      if(level+1 < groups.length)
        appendChildren(parent.children[maxIdx], groups, level+1);
    };
    appendChildren(treeData[0], groups, 0);
    return treeData;
  };

});
