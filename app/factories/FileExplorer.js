'use strict';

angular.module('app')
.factory('FileExplorer', function(){
  var FileExplorer = {};
  var fs = require('fs');
  var path = require("path");
  var homeDir = require('home-dir');
  var remote = require('remote');
  var dialog = remote.require('dialog');
  var bpath;
  /**
  Note: On Windows and Linux, an open dialog could not be both file selector and directory selector at the same time,
  so if you set properties to ['openFile', 'openDirectory'] on these platforms, a directory selector would be showed.
  */

  // Tree
  FileExplorer.tree;

  // Init
  FileExplorer.setBasePath = function(path) {
    bpath = path;
    FileExplorer.refresh();
  }
  FileExplorer.refresh = function() {
    if(!bpath) bpath = homeDir();
    FileExplorer.rootNode = {
      "type": "dir",
      "name": path.basename(bpath),
      "angle": "right",
      "path": bpath,
      "nodes": []
    };
    FileExplorer.tree = [];
    FileExplorer.openDir(FileExplorer.rootNode);
    FileExplorer.tree = FileExplorer.rootNode.nodes;
  }
  var options = {
    "defaultPath": bpath,
    "properties": ['openFile', 'openDirectory', 'createDirectory']
  };

  // Open a file or a change working directory
  FileExplorer.open = function(gpath) {
    var fpath,
        type,
        f,
        p;
    if(!gpath) {
        if(fpath = dialog.showOpenDialog(options)) {
          p = fpath[0];
        }
    }
    else {
      if(gpath == "-r") {
        p = bpath;
      }
      else {
        p = gpath;
      }
    }
    console.log(p);
    if(p) {
    console.log("Path given");
      if(!fs.statSync(p).isFile()) {
        type = "dir";
        FileExplorer.rootNode = {
          "type": "dir",
          "name": path.basename(p),
          "angle": "right",
          "path": p,
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
          name: path.basename(p),
          path: p,
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
    return f;
  };

  FileExplorer.refresh();

  return FileExplorer;
});
