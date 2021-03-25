//this file is incharge of the initialization of the app backend
const top = {};
const electron = require("electron");
const path = require("path");
const reminder = require(path.join(__dirname, "./server/reminder.js"));
const { DBManagement } = require(path.join(__dirname,"./server/dbManagement.js"));
const { Reminder } = reminder;
const { app, BrowserWindow, Menu, ipcMain, nativeImage, Tray } = electron;
const dbPath = path.join(app.getPath('userData'), '/reminders.db');
const iconICOURL = path.join(__dirname, "./assets/images/icon.ico");
let allReminders = [];

//setting this as development will enable the devs tools for the app
process.env.NODE_ENV = "development";

const DB = new DBManagement(dbPath);
const gotTheLock = app.requestSingleInstanceLock();

//if cannot get the lock, means there's another instance running.
//quit the new instance immediately
if (!gotTheLock) {
    app.quit();
}

//when another instance creation is detected, reopen the previous instance
app.on("second-instance", (ev, argv, wd) => {
    if (top.win) {
        if (!top.win.isVisible()) {
        top.win.show();
        } else if (top.win.isMinimized()) {
        top.win.restore();
        }
        top.win.focus();
    }
});

app.on("ready", (ev) => {
    top.win = new BrowserWindow({
        width: 800,
        height: 600,
        center: true,
        minimizable: true,
        show: true,
        webPreferences: {
        nodeIntegration: true,
        webSecurity: true,
        },
        icon: iconICOURL,
    });
    top.win.loadFile(path.join(__dirname, "index.html"))

    //something like telegram where the app will be hidden instead of terminated
    top.win.on("close", (ev) => {
        ev.sender.hide();
        ev.preventDefault();
    });

    top.tray = new Tray(nativeImage.createEmpty());
    const menu = Menu.buildFromTemplate([
        {
            label: "Open My Little Reminder",
            click: (item, window, event) => {
                top.win.show();
            },
        },
        { type: "separator" },
        { role: "quit" }, //this would terminate the app
    ]);
    top.tray.setToolTip("Open My Little Reminder");
    top.tray.setContextMenu(menu);
    top.icons = new BrowserWindow({
        show: false,
        webPreferences: { offscreen: true },
    });
    //this is to load an icon for the hidden app in the taskbar
    top.icons.loadFile(iconICOURL);
    top.icons.webContents.on("paint", (event, dirty, image) => {
        if (top.tray) top.tray.setImage(iconICOURL);
    });

    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    Menu.setApplicationMenu(mainMenu);
});
app.on("before-quit", (ev) => {
    top.win.removeAllListeners("close");
    top = null;
});

const mainMenuTemplate = [
    {
        label: "Menu",
        submenu: [
        {
            label: "Exit",
            accelerator: process.platform == "darwin" ? "Command+Q" : "Ctrl+Q",
            click() {
            app.quit();
            },
        },
        ],
    },
];

// If OSX, add empty object to menu
if (process.platform == "darwin") {
    mainMenuTemplate.unshift({});
}

// Add developer tools option if in dev
if (process.env.NODE_ENV !== "production") {
    mainMenuTemplate.push({
        label: "Developer Tools",
        submenu: [
        {
            role: "reload",
        },
        {
            label: "Toggle DevTools",
            accelerator: process.platform == "darwin" ? "Command+I" : "Ctrl+I",
            click(item, focusedWindow) {
            focusedWindow.toggleDevTools();
            },
        },
        ],
    });
}

//on client page load setup the available reminder (reminder)
ipcMain.on("setupData", () => {
    allReminders = [];
    DB.getAllReminder((data) => {
        data.forEach((row) => {
            const obj = new Reminder(row, itemNotified);
            allReminders.push(obj); //here the time is in string
            const time = row.reminderTime;
            row.reminderTime = time.split(":");
        });
        data = insertStatusIntoObject(data, allReminders);
        //while the objects inside the data, the time is in array form
        top.win.webContents.send("setupSchedules", data);
    });
});

//clearing all the 
ipcMain.on("clearAll", () => {
    allReminders.forEach(item=>{
        item.cancelReminderScheduled()
    });
    allReminders.length = 0;
    DB.clearAll(() => {
        top.win.webContents.send("allReminderCleared");
    });
});

function insertStatusIntoObject(objArr, reminderArr) {
    objArr = objArr.slice();
    reminderArr.forEach((e, index) => {
        objArr[index]["status"] = e.getStatus();
    });
    return objArr;
}

// Catch addItem
ipcMain.on("addItem", (e, reminderTitle, time, date) => {
    DB.insertReminder(reminderTitle, time, date, createNewReminderObject);
});

//create new object instance for the Reminder class
function createNewReminderObject(data, timeArr) {
    const reminder = new Reminder(data, itemNotified);
    allReminders.push(reminder);
    data.reminderTime = timeArr;
    data.status = reminder.getStatus();
    top.win.webContents.send("newItemAdded", data);
}

//item is notified, now make the element to appear as inactive
function itemNotified(reminderID) {
    changeReminderStatusToNotified(reminderID);
    top.win.webContents.send("notifiedReminder", reminderID);
}

//setting the status attribute in the Reminder object as notified to prevent it being activated again
function changeReminderStatusToNotified(reminderID) {
    const obj = getItemFromID(reminderID);
    obj.setReminderNotified();
}

//catching deleteData event from the client side
ipcMain.on("deleteData", (e, reminderID) => {
    if (checkIfReminderExists(reminderID)) {
        DB.deleteReminder(reminderID, () => {
        cancelScedulerInArray(allReminders, reminderID);
        top.win.webContents.send("deletedReminderInDB", reminderID);
        });
    }
});

//canceling a Reminder's scheduler from an array
function cancelScedulerInArray(arr, reminderID) {
    arr.forEach((element, index) => {
        if (element.getDB_ID() == reminderID) {
        arr[index].cancelReminderScheduled();
        arr.splice(index, 1);
        }
    });
}

//getting an object from the array using their database ID
function getItemFromID(reminderID) {
    let result;
    allReminders.forEach((row) => {
        if (row.getDB_ID() == reminderID) result = row;
    });
    return result;
}

function checkIfReminderExists(reminderID) {
  const item = getItemFromID(reminderID);

  return !item ? false : true;
}

ipcMain.on("updateItem", (e, reminderID, newTitle, newTime) => {
    if (checkIfReminderExists(reminderID)) {
        DB.updateReminderInfo(
        { reminderID: reminderID, reminderTime: newTime, reminderTitle: newTitle },
        (reminderObj) => {
            cancelScedulerInArray(allReminders, reminderID);
            createNewReminderObject(
            reminderObj,
            newTime.split(":")
            );
            top.win.webContents.send("updatedReminderInDB", reminderObj);
        }
        );
    }
});