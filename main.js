//this file is incharge of the initialization of the app backend
const top = {};
const electron = require('electron');
const path = require('path');
const url = require('url');
const utilities = require("./utilities.js");
const {DBManagement} = require("./dbManagement.js");
const {Task} = utilities;
const {app, BrowserWindow, Menu, ipcMain, nativeImage, Tray} = electron;
const iconURL = path.join(__dirname, "/assets/logo_128.png");
let allTasks = []

// SET ENV development will enable the devs tools in app
process.env.NODE_ENV = 'development';

const DB = new DBManagement();
const gotTheLock = app.requestSingleInstanceLock();

//check if there's another application instance already opened
if (!gotTheLock) {
  app.quit()
}

app.on("ready", ev => {
  top.win = new BrowserWindow({
      width: 800, height: 600, center: true, minimizable: true, show: true,
      webPreferences: {
          nodeIntegration: true,
          webSecurity: true,
      },         
      icon: iconURL
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
      show: false, 
      webPreferences: {offscreen: true}
  });
  top.icons.loadFile("");
  top.icons.webContents.on("paint", (event, dirty, image) => {
      if (top.tray) top.tray.setImage(iconURL);
  });

  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  Menu.setApplicationMenu(mainMenu);
});
app.on("before-quit", ev => {
    top.win.removeAllListeners("close");
    top = null;
});

const mainMenuTemplate =  [
  {
    label: 'Menu',
    submenu:[
      {
        label: 'Exit',
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
  allTasks = [];
  DB.getAllTask((data)=>{
    data.forEach((row) => {
      const obj = new Task(row, itemNotified);
      allTasks.push(obj); //here the time is in string
      const time = row.taskTime;
      row.taskTime = time.split(":");
    });
    data = insertStatusIntoObject(data, allTasks);
    //while the objects inside the data, the time is in array form
    top.win.webContents.send('setupSchedules', data);
  });
});

ipcMain.on("clearAll", ()=>{
  DB.clearAll(()=>{
    top.win.webContents.send('allTaskCleared');
  });
})

function insertStatusIntoObject (objArr, taskArr) {
  objArr = objArr.slice();
  taskArr.forEach((e, index) => {
    objArr[index]["status"] = e.getStatus();
  });
  return objArr;
}

// Catch addItem
ipcMain.on('addItem', (e, taskTitle, time, date)=>{
  DB.insertTask(taskTitle, time, date, createNewTaskObject);
})

function createNewTaskObject (data, timeArr) {
    const task = new Task(data, itemNotified);
    allTasks.push(task);
    data.taskTime = timeArr;
    data.status = task.getStatus();
    top.win.webContents.send('newItemAdded', data);
}

function itemNotified(taskID){
  changeTaskStatusToNotified(taskID)
  top.win.webContents.send("notifiedTask", taskID);
}

function changeTaskStatusToNotified (taskID) {
  const obj = getItemFromID(taskID);
  obj.setTaskNotified();
}

ipcMain.on("deleteData", (e, taskID)=>{
  if (checkIfTaskExists(taskID)){
    DB.deleteTask(taskID, ()=>{
        cancelScedulerInArray (allTasks, taskID)
        console.log('server side:' + allTasks);
        top.win.webContents.send('deletedTaskInDB', taskID);
    });
  }
});

function cancelScedulerInArray (arr, taskID) {
  arr.forEach((element, index)=>{
    if (element.getDB_ID() == taskID) {
      arr[index].cancelTaskScheduled();
      arr.splice(index, 1)
    }
  });
}

function getItemFromID (taskID) {
  let result;
  allTasks.forEach(row=>{
    if (row.getDB_ID() == taskID ) result = row;
  })
  return result;
}

function checkIfTaskExists (taskID) {
  const item = getItemFromID(taskID);
  return !item? false: true;
}

ipcMain.on("updateItem", (e, taskID, newTitle, newTime)=>{
  if (checkIfTaskExists(taskID)) {
    const _24_H_format = newTime.substring(0, 5);
    DB.updateTaskInfo({taskID: taskID, taskTime: _24_H_format, taskTitle: newTitle}, (taskObj)=>{
      cancelScedulerInArray(allTasks, taskID);
      createNewTaskObject(taskObj, newTime.replace(new RegExp(/PM|AM|\s/, "ig"), "").split(":"));
      printAllTaskTime(allTasks);
      top.win.webContents.send('updatedTaskInDB', taskObj);
    });
  }
})

function printAllTaskTime (arr) {
  arr.forEach(element => {
    console.log(element.getTime());
  });
}
