//finding the position for the newly created item
//this function will return null if it should be placed at the last position in the list
function getPositionForBiggerValue(obj, arr) {
    let position;
    for (let index = 0; index < arr.length; index++) {
        const arrObj = arr[index];
        const result = compareObjectByTime(obj, arrObj);
        if (result == -1) {
        position = index;
        break;
        }
    }
    return position == undefined ? null : position;
}

//finding the position of an item from an array using its object id
function getReminderPositionFromID(id, allReminders) {
    let result = -1;
    allReminders.forEach((element, index) => {
        if (element.reminderID == id) {
        result = index;
        }
    });
    return result;
}

function updateArrayItemPosition(reminderArr) {
    const tempArr = reminderArr.slice();
    tempArr.sort(compareObjectByTime);
    return tempArr;
}

//the value returned will be corresponding to its placement
//later on. -1 will means that the current item will be placed before
//the next value. While, 1 will indicates that the current item should
//swap places with the next item (higher index number). Then, if the returned value
//is 0, leave them unchanged
function compareObjectByTime(obj, obj2) {
    const obj_H = Number(obj.reminderTime[0]);
    const obj2_H = Number(obj2.reminderTime[0]);
    if (obj_H < obj2_H) {
        return -1;
    } else if (obj_H == obj2_H) {
        // if the hour is the same, sort using the minute
        const obj_M = Number(obj.reminderTime[1]);
        const obj2_M = Number(obj2.reminderTime[1]);
        if (obj_M < obj2_M) {
            return -1;
        } else {
            return 1;
        }
    } else {
        return 1;
    }
}

module.exports = {
    updateArrayItemPosition,
    getPositionForBiggerValue,
    getReminderPositionFromID,
    compareObjectByTime,
};
