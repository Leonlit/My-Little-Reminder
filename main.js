const electron = require('electron');
const path = require('path');
const url = require('url');
const utilities = require("./utilities.js");
const {DBManagement} = require("./dbManagement.js");

const {Task} = utilities;
const {app, BrowserWindow, Menu, ipcMain, nativeImage, Tray} = electron;

let allTasks = []

// SET ENV
process.env.NODE_ENV = 'development';

let DB = new DBManagement();
let addWindow;
const top = {};
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
      {label: "Open My Little Reminder", click: (item, window, event) => {
          top.win.show();
      }},
      {type: "separator"},
      {role: "quit"}, 
  ]);
  top.tray.setToolTip("Open My Little Reminder");
  top.tray.setContextMenu(menu);
  top.icons = new BrowserWindow({
      show: false, webPreferences: {offscreen: true}});
  top.icons.loadURL("https://trends.google.com/trends/hottrends/visualize");
  top.icons.webContents.on("paint", (event, dirty, image) => {
      if (top.tray) top.tray.setImage(image.resize({width: 16, height: 16}));
  });

  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  Menu.setApplicationMenu(mainMenu);
});

app.on("before-quit", ev => {
    top.win.removeAllListeners("close");
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

// Catch addItem
ipcMain.on('addItem', (e, taskTitle, time)=>{
  DB.insertTask(taskTitle, time, (data, timeArr) =>{
    const task = new Task(data)
    allTasks.push(task);
    data.taskTime = timeArr;
    console.log(data)
    top.win.webContents.send('newItemAdded', data);
  });
});


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

ipcMain.on("setupData", ()=>{
  DB.getAllTask((data)=>{
    data.forEach((row) => {
      const obj = new Task(row);
      allTasks.push(obj); //here the time is in string
      const time = row.taskTime;
      row.taskTime = time.split(":");
    });
    //while the objects inside the data, the time is in array form
    top.win.webContents.send('setupSchedules', data);
  });
});

ipcMain.on("deleteData", (e, taskID)=>{
  DB.deleteTask(taskID, ()=>{
    console.log("deleted task with ID " + taskID);
    top.win.webContents.send('deletedDataFromDB', taskID)
  })
})