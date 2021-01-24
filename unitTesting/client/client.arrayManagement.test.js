const {
    compareObjectByTime,
    updateArrayItemPosition,
    getPositionForBiggerValue,
    getTaskPositionFromID,
} = require("../../modules/arrayManagement.js");

const dummyArray = [
    {
        status: 0,
        taskID: 88,
        taskTime: ["6", "23"],
        taskTitle: "firstDummy"
    }, {
        status: 1,
        taskID: 105,
        taskTime: ["10", "22"],
        taskTitle: "secondDummy"
    }, {
        status: 1,
        taskID: 106,
        taskTime: ["10", "23"],
        taskTitle: "secondDummy"
    }, {
        status: 1,
        taskID: 107,
        taskTime: ["10", "24"],
        taskTitle: "secondDummy"
    }, {
        status: 1,
        taskID: 99,
        taskTime: ["12", "23"],
        taskTitle: "thirdDummy"
    }, {
        status: 0,
        taskID: 102,
        taskTime: ["13", "23"],
        taskTitle: "fourthDummy"
    }, {
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

//
//  Testing the array management modules functionality
//  function covered:
//
//     compareObjectByTime
//     updateArrayItemPosition
//     getTaskPositionFromID
//     getPositionForBiggerValue

test("Array sorting algorithm is working correctly", ()=>{
    const unsortedArray = shuffle(dummyArray.slice());
    expect(unsortedArray.sort(compareObjectByTime)).toEqual(dummyArray);
});

test("Array rearrangement function working correctly", () => {
    const unsortedArray = shuffle(dummyArray.slice());
    expect(updateArrayItemPosition(unsortedArray)).toEqual(dummyArray);
});

test("Finding the position from item id", () => {
    expect(getTaskPositionFromID(99, dummyArray)).toBe(4);
    expect(getTaskPositionFromID(104, dummyArray)).toBe(6);
    expect(getTaskPositionFromID(106, dummyArray)).toBe(2);
});

test("Getting position for value with bigger value", () => {
    const firstObject = {
        status: 0,
        taskID: 1,
        taskTime: ["5", "23"],
        taskTitle: "firstObject"
    }
    const middleObject = {
        status: 0,
        taskID: 14,
        taskTime: ["11", "23"],
        taskTitle: "MiddleObject"
    };
    const lastObject = {
        status: 0,
        taskID: 1,
        taskTime: ["19", "23"],
        taskTitle: "lastObject"
    }
    expect(getPositionForBiggerValue(firstObject, dummyArray)).toBe(0);
    expect(getPositionForBiggerValue(middleObject, dummyArray)).toBe(4);
    expect(getPositionForBiggerValue(lastObject, dummyArray)).toBeNull();
});