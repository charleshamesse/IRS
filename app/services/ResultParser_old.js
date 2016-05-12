'use strict';

angular.module('app')
.service('ResultParser', function ($filter) {
  var result = {};

  this.parseIrace = function(stdout) {
    result.topline = "Hi! Here's your result";
    result.stdout = stdout;
    result.bottomline = "Done. :)";
    return result;
  };

  this.parseFullExploration = function(stdout) {
    var lines = stdout.match(/[^\r\n]+/g),
    k = 1;
    result.plotData = [];
    result.lines = lines;
    lines.forEach(function(l) {
      var kvPair = l.split(" ");
      var pair = {
        "x": kvPair[0] + " (" + k + ")",
        "y": parseFloat(kvPair[1])
      };
      result.plotData.push(pair);
      ++k;
    });
    return result.plotData;
  };

  this.parseAblation = function(stdout) {
    result.topline = "Hi! Here's your result";
    result.stdout = stdout;
    result.bottomline = "Done. :)";
    return result;
  };

  function getParameterSpace(lines) {
    var parameters = [];
    lines.forEach(function(l) {
      l = l.trim();
      var kv = l.split(' '),
      name = kv[0],
      parameter = name.split('=')[0];
      if(parameters.indexOf(parameter) == -1) parameters.push(parameter);

    });
    return parameters;
  }

  function buildSubTree(lines) {

    var subtrees = [],
    subtree,
    p = getParameterSpace(lines)[0];

    console.log("Building subtree according to " + p);

    lines.forEach(function(l) {
      l = l.trim();
      var kv = l.split(' '),
      name = kv[0],
      score = kv[1],
      parameter = name.split('=')[0];

      if(parameter == p) {
        // Treat previous subtree
        if(subtrees[subtrees.length-1]) {
          subtrees[subtrees.length-1].children = buildSubTree(subtrees[subtrees.length-1].children);
        }
        // Init new substree
        subtree = [];
        subtrees.push({
          "name": name,
          "score": score,
          "children": []
        });
        console.log("new subtree");
      }
      else {
        console.log("simply pushing");
        if(subtrees[subtrees.length-1]) subtrees[subtrees.length-1].children.push(parameter);
      }

    });

    return subtrees;

  }

  this.parseForTreeNew = function(stdout) {
    var lines = stdout.split('\n'),
    treeData = [{
      "name": "Initial",
      "parent": "null",
      "score": 1,
      "children": []
    }],
    currentParameter = "",
    groups = [],
    parameters = [],
    count = 0;

    // Scan all parameters
    lines.forEach(function(l) {
      if(count > 0) {
        l = l.trim();
        var kv = l.split(' '),
        name = kv[0],
        parameter = name.split('=')[0];
        if(parameters.indexOf(parameter) == -1) parameters.push(parameter);
      }
      ++count;
    });
    console.log(parameters);

    // Make subtrees
    parameters.forEach(function(p) {
      console.log("s");
    });

    lines.shift();
    console.log(buildSubTree(lines));

    return treeData;
  };


  function augmentWithDependecies(parameters) {
    angular.forEach(parameters, function(p1) {
      var hasDependencies = false;
      angular.forEach(parameters, function(p2) {
        // Look in p1 conditions if there exists occurences of p2
        // If p1 has dependencies
        var re = new RegExp("\\b" + p2.name, 'g'); //" +p2.name
        var match = p1.conditions.match(re);
        if(match != null) {
          hasDependencies = true;
          //p2.children.push(p1);
          p1.parentName = p2.name;
        }
      });
    });
    return parameters;
  };

  this.parseForTree = function(stdout, parameters) {
    var lines = stdout.split('\n'),
    treeData = [{
      "name": "Initial",
      "parent": "null",
      "score": 1,
      "parameterName": "Initial",
      "children": []
    }],
    previousParameterData = treeData,
    groups = [],
    count = 0;

    // Augment parameters
    parameters = augmentWithDependecies(parameters);
    console.log(parameters);
    // is parent?
    var isAncestor = function(child, parent, parameters) {
      var ret = false;
      while(child.parentName != null) {
        if(child.parentName == parent) {
          console.log(child + " depends on " + parent);
          ret = true;
          break;
        }
        child = $filter('filter')(parameters, {name: child.parentName})[0];
      }
      return ret;
    }
    // Make subtrees
    var getLastChild = function(treeData) {
      var p,c = treeData;
      while(c != null) {
        p = c;
        c = c.children[c.children.length-1];
      }
      return p;
    }
    var getBeforeLastChild = function(treeData) {
      var g,p,c = treeData;
      while(c != null) {
        if(p) g = p;
        if(c) p = c;
        c = c.children[c.children.length-1];
      }
      if(g != null)
        return g;
      else
        return treeData;
    }
    var getChildByLine = function(treeData, line) {
      var found = false;
      var child = {};
      if(treeData.children != []) {
        if(!found) {
        treeData.children.forEach(function(c) {
          console.log("TESTING" + c.line + ", " + line);
          if(c.line == line) {
            console.log(c.line == line);
            console.log(c);
            found = true;
            child = c;
          }
          else {
            getChildByLine(c, line);
          }
        });
        }
      }
      if(found) return child;
      else return false;
    }
    var makeSections = function(lines) {
      var sections = [],
          currentSectionRoot = "";
      lines.forEach(function(l) {
        l = l.trim();
        if(count > 0) {
          var kv = l.split(' '),
          name = kv[0],
          score = kv[1],
          parameterName = name.split('=')[0],
          parameterData = $filter('filter')(parameters, {name: parameterName})[0];


          var thisParameter = {
            "line": l,
            "name": name,
            "parameterName": parameterName,
            "score": score,
            "parent": null,
            "parentLine": null,
            "children": []
          }
          // Check if parameter depends on someone before
          var depends = false;
          if(previousParameterData.name != null && parameterData.parentName != null) {
            var testParameter = previousParameterData;
            var i = 0;
            while(testParameter != null && i < 10) {
              if(parameterData.parentName == testParameter.name) {
                depends = true;
                break;
              }
              testParameter = $filter('filter')(parameters, {name: testParameter.parentName})[0];
              i++;
            }
          }
          if(!depends) {
            var lastChild = getLastChild(treeData[0]);
            if(lastChild.parameterName != parameterName) {
              // loop in parents
              var hasParent = false;
              var testParameter = lastChild;
              var i = 0;
              while(testParameter != null && i < 10) {
                if(parameterData.parentName == testParameter.name) {
                  depends = true;
                  break;
                }
                testParameter = $filter('filter')(parameters, {name: testParameter.parentName})[0];
                i++;
              }
              if(!hasParent) lastChild.children.push(thisParameter);
            }

            else if(lastChild.parameterName == parameterName) {
              var beforeLastChild = getBeforeLastChild(treeData[0]);
              beforeLastChild.children.push(thisParameter);
            }
            console.log(name)
          }
          else {
            console.log("depending: " + name + " on: " + getLastChild(treeData[0]).line);
            console.log(getChildByLine(treeData[0], getLastChild(treeData[0]).line));
            getLastChild(treeData[0]).children.push(thisParameter);
          }
          console.log('\n');
          previousParameterData = parameterData;
        }
        ++count;
      });
      return sections;
    }
    console.log(makeSections(lines));

    return treeData;
  };

  this.parseForTreeOld = function(stdout) {
    var lines = stdout.split('\n'),
    treeData = [{
      "name": "Initial",
      "parent": "null",
      "score": 1,
      "children": []
    }],
    currentParameter = "",
    groups = [],
    count = 0;

    var getGroupByParameter = function(p) {
      var found = false,
      id = 0;
      angular.forEach(groups, function(g) {
        //console.log(g.parameter + ":" + p);
        if(!found) {
          if(g.parameter == p) {
            console.log(p + " same as " + g.parameter);
            found = true;
            return g;
          }
          else
          ++id;
        }
      });
      if(found) return groups[id];
      else return null;
    }

    lines.forEach(function(l) {
      l = l.trim();
      if(count != 0) {
        var kv = l.split(' '),
        name = kv[0],
        score = kv[1],
        parameter = name.split('=')[0],
        group,
        notDisplaced=true;

        group = getGroupByParameter(parameter);
        if(group != null) {
          console.log(l + " belongs to " + group.parameter + " and current is " + currentParameter);
          notDisplaced = false;
          group.values.push({"name": name, "score": score});
        }

        if(currentParameter != parameter && notDisplaced) {
          groups.push({
            "parameter": parameter,
            "values": [{"name": name, "score": score}]
          });
        }
        else if(notDisplaced){
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
