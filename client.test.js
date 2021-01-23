const {
    checkTimePeriodValidity,
    formatTimeToFormat_24_Hour,
    getTimeFrom_24_format,
    checkTimeValidity,
    getDate
} = require("./modules/timeUtil.js");
const {
    updateArrayItemPosition,
    getPositionForBiggerValue,
    getTaskPositionFromID,
    compareObjectByTime
} = require("./modules/arrayManagement.js");

const dummyArray = [
    {
        status: 0,
        taskID: 88,
        taskTime: ["6", "23"],
        taskTitle: "firstDummy"
    },{
        status: 1,
        taskID: 105,
        taskTime: ["10", "22"],
        taskTitle: "secondDummy"
    },{
        status: 1,
        taskID: 105,
        taskTime: ["10", "23"],
        taskTitle: "secondDummy"
    },{
        status: 1,
        taskID: 105,
        taskTime: ["10", "24"],
        taskTitle: "secondDummy"
    },{
        status: 1,
        taskID: 99,
        taskTime: ["12", "23"],
        taskTitle: "thirdDummy"
    },{
        status: 0,
        taskID: 102,
        taskTime: ["13", "23"],
        taskTitle: "fourthDummy"
    },{
        status: 0,
        taskID: 104,
        taskTime: ["18", "23"],
        taskTitle: "fifthDummy"
    }
]

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

test("Array sorting algorithm working correctly", () => {
    const unsortedArray = shuffle(dummyArray.slice());
    expect(unsortedArray.sort(compareObjectByTime)).toEqual(dummyArray);
});

test("Finding the position from item id", () => {
    expect(getTaskPositionFromID(99, dummyArray)).toEqual(2);
});

test("Getting position for value with bigger value", ()=>{
    const dummyObject = {
        status: 0,
        taskID: 14,
        taskTime: ["15", "23"],
        taskTitle: "fifthDummy"
    };
    expect(getPositionForBiggerValue(dummyObject, dummyArray)).toBe(6);
})