'use strict';
const electron = require('electron');
const app = electron.app;

// report crashes to the Electron project
require('crash-reporter').start({
  productName: 'IR Studio',
  companyName: 'Iridia',
	submitURL: 'none',
  autoSubmit: false
});


// adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();

// prevent window being garbage collected
let mainWindow;

function onClosed() {
	// dereference the window
	// for multiple windows store them in an array
	mainWindow = null;
}

function createMainWindow() {
	var electronScreen = require('screen');
	var size = electronScreen.getPrimaryDisplay().workAreaSize;

	const win = new electron.BrowserWindow({
	width: size.width,
	height: size.height
	});

	win.loadURL(`file://${__dirname}/index.html`);
  //win.openDevTools();
	win.on('closed', onClosed);

	return win;
}

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (!mainWindow) {
		mainWindow = createMainWindow();
	}
});

app.on('ready', () => {
	mainWindow = createMainWindow();
});
