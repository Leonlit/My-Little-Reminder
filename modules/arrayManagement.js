//finding the position for the newly created item
//this function will return null if it should be placed at the last position in the list
function getPositionForBiggerValue(obj, arr) {
    let position;
    for (let index = 0; index < arr.length;index++) {
        const arrObj = arr[index];
        console.log(index)
        const result = compareObjectByTime (obj, arrObj);
        if (result == -1) {
            position = index;
            break;
        }
    }
    console.log(position)
    return position == undefined ? null: position ;
}

//finding the position of an item from an array using its object id
function getTaskPositionFromID (id, allTasks) {
    let result = -1;
    allTasks.forEach((element, index) => {
        if (element.taskID == id) {
            result = index;
        }
    });
    return result;
}

function updateArrayItemPosition (taskArr) {
    console.log(taskArr)
    taskArr.sort(compareObjectByTime)
    console.log(taskArr)
}

//the value returned will be corresponding to its placement
//later on. -1 will means that the current item will be placed before 
//the next value. While, 1 will indicates that the current item should
//swap places with the next item (higher index number). Then, if the returned value
//is 0, leave them unchanged
function compareObjectByTime (obj, obj2) {
    const obj_H = Number(obj.taskTime[0]);
    const obj2_H = Number(obj2.taskTime[0]);
    if ( obj_H < obj2_H){
      return -1;
    }else if (obj_H == obj2_H) {
      // if the hour is the same, sort using the minute
      const obj_M = Number(obj.taskTime[1]);
      const obj2_M = Number(obj2.taskTime[1]);
      console.log(obj_M < obj2_M)
      if (obj_M < obj2_M) {
        return -1
      }else {
        return 1
      }
    }else {
      return 1;
    }
  }

module.exports = {
    updateArrayItemPosition,
    getPositionForBiggerValue,
    getTaskPositionFromID,
    compareObjectByTime
}