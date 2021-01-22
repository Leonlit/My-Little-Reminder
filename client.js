//this file is incharge of the client side of the app
//the inter process controller will be the components 
//that's controlling the passing of message between 
//the client and the server 
//all position starts from zero (0)

console.log("refreshed");
const electron = require('electron');
const {ipcRenderer} = electron;
const container = document.querySelector('#taskContainer');
ipcRenderer.send("setupData")
let allTasks = []

const titleInputField = document.querySelector('#titleInput');
const timeInputField = document.querySelector('#timeInput');

//when the window is ready and a message is sent from server
ipcRenderer.on('setupSchedules', function (event, schedules) {
  allTasks = schedules;
  updateArrayItemPosition(allTasks);
  console.log(schedules);
  setupTasks(schedules);
});

//initial setup for the schedules
function setupTasks (schedules) {
  schedules.forEach((objRow, index)=>{
    addTaskIntoPage(objRow, index);
  })
}

//when new item added
ipcRenderer.on('newItemAdded', function (event, schedules) {
  allTasks.push(schedules);
  updateArrayItemPosition(allTasks);
  const position = getPositionForBiggerValue(schedules, allTasks);
  addTaskIntoPage(schedules, position)
});

//triggered when clicked add reminder in the page
function addTaskIntoPage (obj, position) {
  const item = document.createElement("div");
  const title = document.createElement("div");
  const time = getTimeFrom_24_format(obj.taskTime);
  const itemFooter = document.createElement("div");
  const timeHolder = document.createElement("span");
  const editIcon = document.createElement("i");
  const deleteIcon = document.createElement("i");
  
  editIcon.classList = "fa fa-pencil editBtn";
  deleteIcon.classList = "fa fa-close closeBtn";
  itemFooter.classList = "itemFooter";
  title.classList = "itemTitle"

  deleteIcon.addEventListener("click", () => {
    deleteTask(obj.taskID);
  });

  editIcon.addEventListener("click", ()=>{
    editTask(obj.taskID)
  });

  item.classList = "item";
  timeHolder.classList = "timeHolder";
  item.setAttribute("id", obj.taskID);
  title.innerHTML = obj.taskTitle;
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

function deleteTask (ID) {
  ipcRenderer.send("deleteData", ID);
}

//remove the item from the client list when the item is deleted from the database
ipcRenderer.on('deletedTaskInDB', (event, taskID) => {
    deleteTaskFromPage(taskID)
    const position = getTaskPositionFromID(taskID);
    if (position > -1) {
        allTasks.splice(position, 1);
    }
});

ipcRenderer.on("allTaskCleared", ()=>{
  console.log("cleared all");
  container.innerHTML = "";
})

function deleteTaskFromPage(taskID) {
    console.log(taskID);
    document.getElementById(taskID).remove();
}

ipcRenderer.on("updatedTaskInDB", (event, taskObj)=>{
  console.log("test: " + taskObj.taskID);
})

//finding the position of an item from an array using its object id
function getTaskPositionFromID (id) {
  let result = -1;
  allTasks.forEach((element, index) => {
    if (element.taskID == id) {
      result = index;
    }
  });
  return result;
}

//event triggered when certain event has been notified to the user
ipcRenderer.on("notifiedTask", (event, taskID) => {
  notifiedTask(taskID);
});

//change their style to dark mode
function notifiedTask (taskID) {
  const element = document.getElementById(taskID);
  element.classList.toggle("itemNotified");
}

//function triggered when the pencil icon is clicked
function editTask (id) {
  const itemCont = document.getElementById(id);
  enableTaskEditMode(itemCont);
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
function enableTaskEditMode (itemCont) {
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

  const position = getTaskPositionFromID(itemCont.id);
  editClone.addEventListener("click", ()=>{
    const title = titleCont.textContent;
    const timeValidity = checkTimeValidity(timeCont.textContent);
    let time_24_hFormat;
    if (timeValidity) {
      time_24_hFormat = formatTimeToFormat_24_Hour(timeValidity.hour, timeValidity.minute, timeValidity.timePeriod);
      try {
        allTasks.splice(position, 1);
        console.log(allTasks);
      }catch (ex) {
        console.log(ex);
      }
      ipcRenderer.send("updateItem", Number(itemCont.id) ,title, time_24_hFormat);
      deleteTaskFromPage(itemCont.id);
    }
  })
  delClone.addEventListener("click", ()=>{
    disableTaskEditMode(itemCont, ori_title, ori_time );
  });
}

//when user cancelled the edit during editing mode
function disableTaskEditMode (itemCont, ori_title, ori_time) {
  const position = getTaskPositionFromID(itemCont.id);
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
    editTask(itemCont.id)
  })
  delClone.addEventListener("click", ()=>{
    deleteTask(itemCont.id);
  });
}

//checking for the validation on the time format
// HH:MM Period
function checkTimeValidity (timeString) {
  const timeArr = timeString.split(":");
  const secondSection = timeArr[1].split(" ");
  const hour = timeArr[0];
  const timePeriod = secondSection[secondSection.length - 1];
  const minute = secondSection[0];
  console.log(secondSection, timePeriod);
  const isPeriodValid = checkTimePeriodValidity(timePeriod);

  if (minute.length > 2 || hour.length > 2 || minute > 59 ||
    hour > 12 || hour < 1 || minute < 0) {
      alert("The time format is invalid!!! Please try again.");
  }else {
    if (!isPeriodValid) {
      alert("The time period is invalid!!! Please try again.");
    }else {
      return {hour, minute, timePeriod};
    }
  }
  return false;
}

//formatting the time from 12-hour format to 24
//this is needed because during the editing of an
//item in the page
function formatTimeToFormat_24_Hour (hour, minute, timePeriod) {
  if (timePeriod.toLowerCase() == "pm") {
    if (hour < 12 ) {
      hour = Number(hour) + 12;
    }
  }else {
    if (hour == 12) {
        hour = 0;
    }
  }
  return `${`${hour}`.padStart(2, '0')}:${minute.padStart(2, '0')} ${timePeriod.toUpperCase()}`;
}

function checkTimePeriodValidity (period) {
  period = period.toLowerCase();
  return period == "am" || period == "pm";
}

//adding new item to database
function addNewTaskToStorage (event) {
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

//getting the current date with the format of yyyy-mm-dd
function getDate(dateObj=null) {
  let today = new Date();
  if (dateObj) {
    today = new Date (dateObj);
  }
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear();
  return yyyy + "-" + mm + "-" + dd;
}

function updateArrayItemPosition (taskArr) {
  taskArr.sort(compareObjectByTime)
}

//finding the position for the newly created item
//this function will return null if it should be placed at the last position in the list
function getPositionForBiggerValue(obj, arr) {
  let position;
  for (let index = 0; index < arr.length;index++) {
    const arrObj = arr[index];
    const result = compareObjectByTime (obj, arrObj);
    if (result == -1) {
      position = index - 1;
      break;
    }
  }
  return position == undefined ? null: position ;
}

//the value returned will be corresponding to its placement
//later on. -1 will means that the current item will be placed before 
//the next value. While, 1 will indicates that the current item should
//swap places with the next item (higher index number). Then, if the returned value
//is 0, leave them unchanged
function compareObjectByTime (obj, obj2) {
  const obj_H = obj.taskTime[0];
  const obj2_H = obj2.taskTime[0];
  if ( obj_H < obj2_H){
    return -1;
  }else if (obj_H == obj2_H) {
    // if the hour is the same, sort using the minute
    const obj_M = obj.taskTime[1];
    const obj2_M = obj2.taskTime[1];
    if (obj_M < obj2_M) {
      return -1
    }else {
      return 1
    }
  }else {
    return 1;
  }
}

//changing 24-hour format to a 12-hour time format
function getTimeFrom_24_format (timeArr) {
  let hour = Number(timeArr[0]);
  const minute = timeArr[1];
  let str = "PM"
  if (hour < 12) {
      str = "AM"
  }
  if (hour > 12) {
    hour -= 12;
  }
  //set hour to 12 to the hour if the hour is equal to zero, this is created
  //so that in the case where in 24-hour format, the hour is equal to 0 while its Am,
  //since we don't want to show user 0, we need to change it to 12 
  if(hour == 0) {
    hour = 12;
  }
  return `${hour}:${minute} ${str}`;
}