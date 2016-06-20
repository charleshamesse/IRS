angular.module('app')
	.controller('IndexController', function ($scope, FileExplorer, FileManager) {

		// Globals
		const remote = require('remote');
		const app = remote.app;
		const Menu = remote.Menu;
		const MenuItem = remote.MenuItem;
		const fs = require('fs');
		const mpath = require('path');
		const cfgpath = app.getPath("userData") + mpath.sep + "cfg.json";
		const dialog = remote.require('dialog');
		$scope.FileExplorer = FileExplorer;
		$scope.FileManager = FileManager;

		// Config
		$scope.Main = {
			"cfg": {
				"workspace": "",
				"rscript": ""
			},
			"displayProjectWindow": false
		};

		var cfgExists = false;
		try {
			if (fs.statSync(cfgpath).isFile()) {
				cfgExists = true;
				var data;
				if ((data = fs.readFileSync(cfgpath, 'utf8'))) {
					$scope.Main.cfg = angular.fromJson(data);
					// Set file explorer root node
					$scope.FileExplorer.setBasePath($scope.Main.cfg.workspace);
					$scope.FileManager.setBasePath($scope.Main.cfg.workspace);
				}
			}
		}
		catch (e) {
			console.log("There isn't any config file" + e);
		}
		if (!cfgExists) {
			$scope.Main.displayCfg = true;
		}

		$scope.Main.openWorkspace = function () {
			var dir = dialog.showOpenDialog({properties: ["openDirectory", "createDirectory"]});
			if (!dir) return 0;
			$scope.Main.cfgWorkspace = dir[0];
		}

		$scope.Main.openRscript = function () {
			var file = dialog.showOpenDialog({properties: ["openFile"]});
			if (!file) return 0;
			$scope.Main.cfgRscript = file[0];
		}
		$scope.Main.updateConfig = function () {
			var success = false,
				data = {
					"workspace": $scope.Main.cfgWorkspace,
					"rscript": $scope.Main.cfgRscript
				};
			try {
				// write on config file, exists it or not.
				fs.writeFileSync(cfgpath, JSON.stringify(data), 'utf8');
				success = true;
			}
			catch (e) {
				console.log(e);
			}
			$scope.Main.configUpdated = success;
			return success;
		};

		// Menu
		var template = [
			{
				label: 'File',
				submenu: [
					{
						label: 'New Scenario',
						click: function (item, focusedWindow) {
							var path = $scope.FileManager.createSetupFile();
							if (path) var file = $scope.FileExplorer.open(path);
							if (file) {
								$scope.FileManager.openFile(file);
								$scope.FileExplorer.refresh();
								$scope.$apply();
							}
						},
						accelerator: 'CmdOrCtrl+Option+S'
					},
					{
						label: 'New Exploration',
						click: function (item, focusedWindow) {
							var path = $scope.FileManager.createExplorationFile();
							if (path) var file = $scope.FileExplorer.open(path);
							if (file) {
								$scope.FileManager.openFile(file);
								$scope.FileExplorer.refresh();
								$scope.$apply();
							}
						},
						accelerator: 'CmdOrCtrl+Option+E'
					},
					{
						label: 'Open...',
						click: function (item, focusedWindow) {
							var ret = $scope.FileExplorer.open();
							if (ret.type == "file") FileManager.openFile(ret);
							$scope.$apply();
						},
						accelerator: 'CmdOrCtrl+O',
					},
					{
						type: 'separator'
					},
					{
						label: 'Save',
						click: function (item, focusedWindow) {
							$scope.FileManager.save();
						},
						accelerator: 'CmdOrCtrl+S',
					},
					{
						label: 'Save As...',
						click: function (item, focusedWindow) {
							$scope.FileManager.saveAs();
						},
						accelerator: 'Shift+CmdOrCtrl+S',
					}
				]
			},
			{
				label: 'Edit',
				submenu: [
					{
						label: 'Undo',
						accelerator: 'CmdOrCtrl+Z',
						role: 'undo'
					},
					{
						label: 'Redo',
						accelerator: 'Shift+CmdOrCtrl+Z',
						role: 'redo'
					},
					{
						type: 'separator'
					},
					{
						label: 'Cut',
						accelerator: 'CmdOrCtrl+X',
						role: 'cut'
					},
					{
						label: 'Copy',
						accelerator: 'CmdOrCtrl+C',
						role: 'copy'
					},
					{
						label: 'Paste',
						accelerator: 'CmdOrCtrl+V',
						role: 'paste'
					},
					{
						label: 'Select All',
						accelerator: 'CmdOrCtrl+A',
						role: 'selectall'
					},
				]
			},
			{
				label: 'View',
				submenu: [
					{
						label: 'Reload',
						accelerator: 'CmdOrCtrl+R',
						click: function (item, focusedWindow) {
							if (focusedWindow)
								focusedWindow.reload();
						}
					}, {
						label: 'Toggle Project Window',
						accelerator: 'CmdOrCtrl+1',
						click: function (item, focusedWindow) {
							$scope.Main.displayProjectWindow = !$scope.Main.displayProjectWindow;
							$scope.$apply();
						}
					},
					{
						label: 'Toggle Full Screen',
						accelerator: (function () {
							if (process.platform == 'darwin')
								return 'Ctrl+Command+F';
							else
								return 'F11';
						})(),
						click: function (item, focusedWindow) {
							if (focusedWindow)
								focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
						}
					},
					{
						label: 'Toggle Developer Tools',
						accelerator: (function () {
							if (process.platform == 'darwin')
								return 'Alt+Command+I';
							else
								return 'Ctrl+Shift+I';
						})(),
						click: function (item, focusedWindow) {
							if (focusedWindow)
								focusedWindow.toggleDevTools();
						}
					},
				]
			},
			{
				label: 'Window',
				role: 'window',
				submenu: [
					{
						label: 'Minimize',
						accelerator: 'CmdOrCtrl+M',
						role: 'minimize'
					},
					{
						label: 'Close',
						accelerator: 'CmdOrCtrl+W',
						role: 'close'
					},
				]
			},
			{
				label: 'Help',
				role: 'help',
				submenu: [
					{
						label: 'Learn More',
						click: function () {
							require('electron').shell.openExternal('http://electron.atom.io')
						}
					},
				]
			},
		];

		if (process.platform == 'darwin') {
			var name = "IR Studio";
			template.unshift({
				label: name,
				submenu: [
					{
						label: 'About ' + name,
						role: 'about'
					},
					{
						type: 'separator'
					},
					{
						label: 'Services',
						role: 'services',
						submenu: []
					},
					{
						type: 'separator'
					},
					{
						label: 'Hide ' + name,
						accelerator: 'Command+H',
						role: 'hide'
					},
					{
						label: 'Hide Others',
						accelerator: 'Command+Alt+H',
						role: 'hideothers'
					},
					{
						label: 'Show All',
						role: 'unhide'
					},
					{
						type: 'separator'
					},
					{
						label: 'Quit',
						accelerator: 'Command+Q',
						click: function () {
							remote.app.quit();
						}
					},
				]
			});
			// Window menu.
			template[3].submenu.push(
				{
					type: 'separator'
				},
				{
					label: 'Bring All to Front',
					role: 'front'
				}
			);
		}

		var menu = Menu.buildFromTemplate(template);
		Menu.setApplicationMenu(menu);

	});
