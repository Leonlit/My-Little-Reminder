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
  updateObjectPosition(allTasks);
  console.log(schedules);
  setupSchedules(schedules);
});

//initial setup for the schedules
function setupSchedules (schedules) {
  schedules.forEach((objRow, index)=>{
    addItemToBody(objRow, index);
  })
}

//when new item added
ipcRenderer.on('newItemAdded', function (event, schedules) {
  allTasks.push(schedules);
  updateObjectPosition(allTasks);
  addNewSchedules(schedules);
});

//when a new schedule is added
function addNewSchedules (obj) {
  const position = getPositionForBiggerValue(obj, allTasks);
  addItemToBody(obj, position)
}

function addItemToBody (obj, position) {
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
    deleteTask(obj.taskID, position);
  });

  editIcon.addEventListener("click", ()=>{
    editTask(obj, position)
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
    item.style.backgroundColor = "grey";
  }

  if (position === null) {
    container.appendChild(item);
  }else {
    container.insertBefore(item, container.children[position]);
  }
}

function deleteTask (ID) {
  ipcRenderer.send("deleteData", ID);
}

ipcRenderer.on('deletedTaskInDB', (event, taskID) => {
  document.getElementById(taskID).remove();
  const position = getTaskPositionFromID(taskID);
  console.log("position" + position);
  if (position > -1) {
    allTasks.splice(position, 1);
    console.log(allTasks);
  }
});

ipcRenderer.on("updatedTaskInDB", (event, taskObj)=>{
  console.log(taskObj);
})

function getTaskPositionFromID (id) {
  let result = -1;
  allTasks.forEach((element, index) => {
    if (element.taskID == id) {
      console.log("found" + id);
      result = index;
    }
  });
  return result;
}

ipcRenderer.on("notifiedTask", (event, taskID) => {
  notifiedTask(taskID);
});

function notifiedTask (taskID) {
  const element = document.getElementById(taskID);
  element.style.backgroundColor = "grey";
}

function editTask (obj, position) {
  const itemCont = document.getElementById(obj.taskID);
  enableTaskEditMode(obj, itemCont);
  makeContEditable(itemCont);
}

function makeContEditable (itemCont) {
  const titleCont = itemCont.getElementsByClassName("itemTitle")[0];
  const timeCont = itemCont.getElementsByTagName("span")[0];
  titleCont.contentEditable = "true";
  timeCont.contentEditable = "true";
}

function makeContNotEditable (itemCont) {
  const titleCont = itemCont.getElementsByClassName("itemTitle")[0];
  const timeCont = itemCont.getElementsByTagName("span")[0];
  titleCont.contentEditable = "false";
  timeCont.contentEditable = "false";
}

function resetContContent (itemCont, title, time) {
  const titleCont = itemCont.getElementsByClassName("itemTitle")[0];
  const timeCont = itemCont.getElementsByTagName("span")[0];
  titleCont.textContent = title;
  timeCont.textContent = time;
}

function enableTaskEditMode (obj, itemCont) {
  const editIcon = itemCont.getElementsByClassName("editBtn")[0];
  const delIcon = itemCont.getElementsByClassName("closeBtn")[0];
  const titleCont = itemCont.getElementsByClassName("itemTitle")[0];
  const timeCont = itemCont.getElementsByTagName("span")[0];

  editIcon.classList.remove("fa-pencil");
  editIcon.classList.add("fa-check");
  const ori_title = titleCont.textContent;
  const ori_time = timeCont.textContent;

  const editClone = editIcon.cloneNode(true);
  const delClone = delIcon.cloneNode(true);
  editIcon.parentNode.replaceChild(editClone, editIcon);
  delIcon.parentNode.replaceChild(delClone, delIcon);

  const position = getTaskPositionFromID(itemCont.id);
  editClone.addEventListener("click", ()=>{
    const title = ori_title;
    const timeValidity = checkTimeValidity(ori_time);
    let time_24_hFormat;
    if (timeValidity) {
      time_24_hFormat = formatTimeToFormat_24_Hour(timeValidity.hour, timeValidity.minute, timeValidity.timePeriod);
    }
    if (timeValidity) {
      document.getElementById(itemCont.id).remove();
      try {
        allTasks.splice(position, 1);
        console.log(allTasks);
      }catch (ex) {
        console.log(ex);
      }
      ipcRenderer.send("updateItem", Number(itemCont.id) ,title, time_24_hFormat);
    }
  })
  delClone.addEventListener("click", ()=>{
    disableTaskEditMode(obj, itemCont, ori_title, ori_time );
  });
}

function disableTaskEditMode (obj, itemCont, ori_title, ori_time) {
  const position = getTaskPositionFromID(itemCont.id);
  makeContNotEditable(itemCont);
  resetContContent(itemCont, ori_title, ori_time);
  const editIcon = itemCont.getElementsByClassName("editBtn")[0];
  const delIcon = itemCont.getElementsByClassName("closeBtn")[0];
  editIcon.classList.remove("fa-check");
  editIcon.classList.add("fa-pencil");

  const editClone = editIcon.cloneNode(true);
  const delClone = delIcon.cloneNode(true);
  editIcon.parentNode.replaceChild(editClone, editIcon);
  delIcon.parentNode.replaceChild(delClone, delIcon);

  editClone.addEventListener("click", ()=>{
    editTask(obj, position)
  })
  delClone.addEventListener("click", ()=>{
    deleteTask(obj.taskID, position);
  });
}

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

function formatTimeToFormat_24_Hour (hour, minute, timePeriod) {
  if (timePeriod.toLowerCase() == "pm") {
    if (hour < 12 ) {
      hour = Number(hour) + 12;
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

function clearFormField() {
  titleInputField.value="";
  timeInputField.value="";
}

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

function updateObjectPosition (taskArr) {
  taskArr.sort(compareObjectByTime)
}

function getPositionForBiggerValue(obj, arr) {
  let position;
  for (let index = 0; index < arr.length;index++) {
    const arrObj = arr[index];
    const result = compareObjectByTime (obj, arrObj);
    if (result == -1) {
      console.log(index + " matched positon");
      position = index - 1;
      break;
    }
  }
  console.log("position" + position);
  return position == undefined ? null: position ;
}

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
  if(hour == 0) {
    hour = 12;
  }

  return `${hour}:${minute} ${str}`;
}