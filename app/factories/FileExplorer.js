'use strict';

angular.module('app')
.factory('FileExplorer', function(){
  var FileExplorer = {};
  var fs = require('fs');
  var path = require("path");

  // Tree
  FileExplorer.tree = [];

  // Set root node
  FileExplorer.rootNode = {
    "type": "dir",
    "name": "EPB",
    "angle": "right",
    "path": '/Users/charleshamesse/Documents/EPB/',
    "nodes": []
  };

  // Open directory
  FileExplorer.openDir = function(f) {
    if(f.angle == "down") { // close it
      f.nodes = [];
      f.angle = "right";
      return 0;
    }
    f.angle = "down";
    var dir = f.path;
    var currentTree = [];

    var files = fs.readdirSync(dir);
    files.map(function (file) {
      return path.join(dir, file);
    }).forEach(function (file) {
      if(!fs.statSync(file).isFile()) {
        f.nodes.push({
          "type": "dir",
          "name": path.basename(file),
          "angle": "right",
          "path": file,
          "nodes": []
        });
      }
      else if(path.basename(file).charAt(0) != '.'){
        f.nodes.push({
          "type": "file",
          "name": path.basename(file),
          "path": file,
          "isOpened": false
        });
      }
    });
  };

  // Init
  FileExplorer.openDir(FileExplorer.rootNode);
  FileExplorer.tree = FileExplorer.rootNode.nodes;

  return FileExplorer;
});
