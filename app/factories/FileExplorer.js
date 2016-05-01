'use strict';

angular.module('app')
.factory('FileExplorer', function(){
  var FileExplorer = {};
  var fs = require('fs');
  var path = require("path");
  var homeDir = require('home-dir');
  var remote = require('remote');
  var dialog = remote.require('dialog');
  var options = {
    "defaultPath": homeDir(),
    "properties": ['openFile', 'openDirectory', 'createDirectory']
  };
  /**
  Note: On Windows and Linux, an open dialog could not be both file selector and directory selector at the same time,
  so if you set properties to ['openFile', 'openDirectory'] on these platforms, a directory selector would be showed.
  */

  // Tree
  FileExplorer.tree = [];

  // Set root node
  FileExplorer.rootNode = {
    "type": "dir",
    "name": path.basename(homeDir()),
    "angle": "right",
    "path": homeDir(),
    "nodes": []
  };

  // Open a file or a change working directory
  FileExplorer.open = function() {
    var fpath,
        type,
        f;
    if(fpath = dialog.showOpenDialog(options)) {
    console.log("Path given");
      if(!fs.statSync(fpath[0]).isFile()) {
        type = "dir";
        FileExplorer.rootNode = {
          "type": "dir",
          "name": path.basename(fpath[0]),
          "angle": "right",
          "path": fpath[0],
          "nodes": []
        };

        f = {type: "dir"};

        // Init
        FileExplorer.openDir(FileExplorer.rootNode);
        FileExplorer.tree = FileExplorer.rootNode.nodes;
      }
      else {
        type = "file";
        f = {
          type: "file",
          name: path.basename(fpath[0]),
          path: fpath[0],
          isOpened: false
        };
      }
      return f;
    }
  }

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
