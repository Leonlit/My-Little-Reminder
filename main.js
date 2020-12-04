const electron = require('electron');
const path = require('path');
const url = require('url');
const notifier = require('node-notifier');
const schedule = require('node-schedule');
const utilities = require("./utilities.js");

// SET ENV
process.env.NODE_ENV = 'development';
const {Task, Scheduler} = utilities;
const {app, BrowserWindow, Menu, ipcMain, nativeImage, Tray} = electron;
let addWindow;
let top = {};
app.on("ready", ev => {

  top.win = new BrowserWindow({
      width: 800, height: 600, center: true, minimizable: true, show: true,
      webPreferences: {
          nodeIntegration: true,
          webSecurity: true,
      },                  
  });
  top.win.loadURL(url.format({
    pathname: path.join(__dirname, 'mainWindow.html'),
    protocol: 'file:',
    slashes:true
  }));

  //something like telegram
  top.win.on("close", ev => {
      ev.sender.hide();
      ev.preventDefault();
  });

  top.tray = new Tray(nativeImage.createEmpty());
  const menu = Menu.buildFromTemplate([
      {label: "Open to-do list", click: (item, window, event) => {
          top.win.show();
      }},
      {type: "separator"},
      {role: "quit"}, 
  ]);
  top.tray.setToolTip("Open to-do list");
  top.tray.setContextMenu(menu);
  top.icons = new BrowserWindow({
      show: false, webPreferences: {offscreen: true}});
  top.icons.loadURL("https://trends.google.com/trends/hottrends/visualize");
  top.icons.webContents.on("paint", (event, dirty, image) => {
      if (top.tray) top.tray.setImage(image.resize({width: 16, height: 16}));
  });

  // Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // Insert menu
  Menu.setApplicationMenu(mainMenu);
});
app.on("before-quit", ev => {
    // BrowserWindow "close" event spawn after quit operation,
    // it requires to clean up listeners for "close" event
    top.win.removeAllListeners("close");
    // release windows
    top = null;
});

// Handle add item window
function createAddWindow(){
  addWindow = new BrowserWindow({
    width: 300,
    height:200,
    title:'Add Shopping List Item'
  });
  addWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'addWindow.html'),
    protocol: 'file:',
    slashes:true
  }));
  // Handle garbage collection
  addWindow.on('close', function(){
    addWindow = null;
  });
}

// Catch item:add
ipcMain.on('item:add', function(e, taskTitle, time){
  const task = new Task(taskTitle, time);
  console.log(task)
  // Still have a reference to addWindow in memory. Need to reclaim memory (Grabage collection)
  //addWindow = null;
});

async function scheduleTask (taskTitle,date) {
  await schedule.scheduleJob(date, function(){
    notifier.notify({
      title: taskTitle,
      message: "test",
    },
    function (err, response) {
      console.log(err, response)
    });
});
}


// Create menu template
const mainMenuTemplate =  [
  // Each object is a dropdown
  {
    label: 'File',
    submenu:[
      {
        label:'Add Item',
        click(){
          createAddWindow();
        }
      },
      {
        label:'Clear Items',
        click(){
          mainWindow.webContents.send('item:clear');
        }
      },
      {
        label: 'Quit',
        accelerator:process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
        click(){
          app.quit();
        }
      }
    ]
  }
];

// If OSX, add empty object to menu
if(process.platform == 'darwin'){
  mainMenuTemplate.unshift({});
}

// Add developer tools option if in dev
if(process.env.NODE_ENV !== 'production'){
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu:[
      {
        role: 'reload'
      },
      {
        label: 'Toggle DevTools',
        accelerator:process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow){
          focusedWindow.toggleDevTools();
        }
      }
    ]
  });
}
