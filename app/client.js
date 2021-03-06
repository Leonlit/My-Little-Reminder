//this file is incharge of the client side of the app
//the inter process controller will be the components 
//that's controlling the passing of message between 
//the client and the server 
//all position starts from zero (0)

const electron = require('electron');
const path = require("path");
const {
    formatTimeToFormat_24_Hour,
    getTimeFrom_24_format,
    checkTimeValidity,
    getDate
} = require(path.join(__dirname, "./modules/timeUtil.js"));

const {
    updateArrayItemPosition,
    getPositionForBiggerValue,
    getReminderPositionFromID
} = require(path.join(__dirname, "./modules/arrayManagement.js"));

const {ipcRenderer} = electron;
const container = document.querySelector('#reminderContainer');
ipcRenderer.send("setupData")
let allReminders = []

const titleInputField = document.querySelector('#titleInput');
const timeInputField = document.querySelector('#timeInput');

//when the window is ready and a message is sent from server
ipcRenderer.on('setupSchedules', function (event, schedules) {
    allReminders = updateArrayItemPosition(schedules);
    setupReminders(schedules);
});

//initial setup for the schedules, array need to be revered as append works by appending the first item first
function setupReminders (schedules) {
    schedules.reverse();
    schedules.forEach((objRow, index)=>{
        addReminderIntoPage(objRow, index);
    })
}

//when new item added
ipcRenderer.on('newItemAdded', function (event, schedules) {
    const position = getPositionForBiggerValue(schedules, allReminders);
    allReminders.push(schedules);
    allReminders = updateArrayItemPosition(allReminders);
    addReminderIntoPage(schedules, position)
});

//triggered when clicked add reminder in the page
function addReminderIntoPage (obj, position) {
    const item = document.createElement("div");
    const title = document.createElement("div");
    const time = getTimeFrom_24_format(obj.reminderTime);
    const itemFooter = document.createElement("div");
    const timeHolder = document.createElement("span");
    const editIcon = document.createElement("i");
    const deleteIcon = document.createElement("i");

    editIcon.classList = "fa fa-pencil editBtn";
    deleteIcon.classList = "fa fa-close closeBtn";
    itemFooter.classList = "itemFooter";
    title.classList = "itemTitle"

    deleteIcon.addEventListener("click", () => {
        deleteReminder(obj.reminderID);
    });

    editIcon.addEventListener("click", ()=>{
        editReminder(obj.reminderID)
    });

    item.classList = "item";
    timeHolder.classList = "timeHolder";
    item.setAttribute("id", obj.reminderID);
    title.innerHTML = obj.reminderTitle;
    timeHolder.innerHTML = time;
    itemFooter.appendChild(editIcon)
    itemFooter.appendChild(deleteIcon)
    itemFooter.appendChild(timeHolder)

    item.appendChild(title);
    item.appendChild(itemFooter);
    if (obj.status == 1) {
        //just in case the user entered a time where its already pass that time
        item.classList.toggle("itemNotified");
    }

    //if its placed at the last, just append it to the container
    //if its not, just place it before an child node in the container
    if (position === null) {
        container.appendChild(item);
    }else {
        container.insertBefore(item, container.children[position]);
    }
}

function deleteReminder (ID) {
    ipcRenderer.send("deleteData", ID);
}

//remove the item from the client list when the item is deleted from the database
ipcRenderer.on('deletedReminderInDB', (event, reminderID) => {
    deleteReminderFromPage(reminderID)
    const position = getReminderPositionFromID(reminderID, allReminders);
    if (position > -1) {
        allReminders.splice(position, 1);
    }
});

ipcRenderer.on("allReminderCleared", ()=>{
    container.style.opacity = "0";
    setTimeout(() => {
        container.innerHTML = "";
    }, 5000);
})

function deleteReminderFromPage(reminderID) {
    document.getElementById(reminderID).style.opacity = "0";
    setTimeout(() => {
        document.getElementById(reminderID).remove();
    }, 3000);
}

//event triggered when certain event has been notified to the user
ipcRenderer.on("notifiedReminder", (event, reminderID) => {
    notifiedReminder(reminderID);
});

//change their style to dark mode
function notifiedReminder (reminderID) {
    const element = document.getElementById(reminderID);
    element.classList.toggle("itemNotified");
}

//function triggered when the pencil icon is clicked
function editReminder (id) {
    const itemCont = document.getElementById(id);
    enableReminderEditMode(itemCont);
    makeContEditable(itemCont);
}

//after user has clicked the pencil icon in an item,
//this function will be called to change the content
// of the item text content into editable
function makeContEditable (itemCont) {
    const {titleCont, timeCont} = getItemTitleAndTimeCont(itemCont);
    titleCont.contentEditable = "true";
    itemCont.style.border = "3px solid orange";
    timeCont.contentEditable = "true";
}

//when the user cancelled the editing mode, we need to make the
//item text field to be non-editable
function makeContNotEditable (itemCont) {
    const {titleCont, timeCont} = getItemTitleAndTimeCont(itemCont);
    titleCont.contentEditable = "false";
    itemCont.style.border = "0px solid transparent";
    timeCont.contentEditable = "false";
}

//made this as a function as repeated too many times
function getItemTitleAndTimeCont (itemCont) {
    const titleCont = itemCont.getElementsByClassName("itemTitle")[0];
    const timeCont = itemCont.getElementsByTagName("span")[0];
    return {titleCont, timeCont};
}

//selecting the pencil and cross icon
//also made this into a function to keep it dry
//although there's still alot of spaghetti code
function getEditAndDeleteIconCont(itemCont) {
    const editIcon = itemCont.getElementsByClassName("editBtn")[0];
    const delIcon = itemCont.getElementsByClassName("closeBtn")[0];
    return {editIcon, delIcon};
}

//when user cancels the editing process, reset the values
function resetContContent (itemCont, title, time) {
    const {titleCont, timeCont} = getItemTitleAndTimeCont(itemCont);
    titleCont.textContent = title;
    timeCont.textContent = time;
}

//when the pencil icon is clicked, enable the item to
//be in edit mode
function enableReminderEditMode (itemCont) {
const {editIcon, delIcon} = getEditAndDeleteIconCont(itemCont);
const {titleCont, timeCont} = getItemTitleAndTimeCont(itemCont);

editIcon.classList.toggle("fa-pencil");
editIcon.classList.toggle("fa-check");
const ori_title = titleCont.textContent;
const ori_time = timeCont.textContent;

const editClone = editIcon.cloneNode(true);
const delClone = delIcon.cloneNode(true);
editIcon.parentNode.replaceChild(editClone, editIcon);
delIcon.parentNode.replaceChild(delClone, delIcon);

const position = getReminderPositionFromID(itemCont.id, allReminders);
    editClone.addEventListener("click", ()=>{
        const title = titleCont.textContent;
        const timeValidity = checkTimeValidity(timeCont.textContent);
        console.log(timeCont.textContent);
        let time_24_hFormat;
        if (timeValidity) {
            time_24_hFormat = formatTimeToFormat_24_Hour(timeValidity.hour, timeValidity.minute, timeValidity.timePeriod);
            try {
                allReminders.splice(position, 1);
            }catch (ex) {
                console.log(ex);
            }
            ipcRenderer.send("updateItem", Number(itemCont.id) ,title, time_24_hFormat);
            deleteReminderFromPage(itemCont.id);
        }
    })
    delClone.addEventListener("click", ()=>{
        disableReminderEditMode(itemCont, ori_title, ori_time );
    });
}

//when user cancelled the edit during editing mode
function disableReminderEditMode (itemCont, ori_title, ori_time) {
    const position = getReminderPositionFromID(itemCont.id, allReminders);
    makeContNotEditable(itemCont);
    resetContContent(itemCont, ori_title, ori_time);
    const {editIcon, delIcon} = getEditAndDeleteIconCont(itemCont);
    editIcon.classList.toggle("fa-check");
    editIcon.classList.toggle("fa-pencil");

    const editClone = editIcon.cloneNode(true);
    const delClone = delIcon.cloneNode(true);
    editIcon.parentNode.replaceChild(editClone, editIcon);
    delIcon.parentNode.replaceChild(delClone, delIcon);

    editClone.addEventListener("click", ()=>{
        editReminder(itemCont.id)
    })
    delClone.addEventListener("click", ()=>{
        deleteReminder(itemCont.id);
    });
}

//adding new item to database
function addNewReminderToStorage (event) {
    event.preventDefault();
    const date = getDate();
    ipcRenderer.send('addItem', titleInputField.value, timeInputField.value, date);
    clearFormField();
}

function clearAll () {
    ipcRenderer.send('clearAll');
}

function clearFormField() {
    titleInputField.value="";
    timeInputField.value="";
}