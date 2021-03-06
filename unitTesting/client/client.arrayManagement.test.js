const {
    compareObjectByTime,
    updateArrayItemPosition,
    getPositionForBiggerValue,
    getReminderPositionFromID,
} = require("../../app/modules/arrayManagement.js");

const dummyArray = [
    {
        status: 0,
        reminderID: 88,
        reminderTime: ["6", "23"],
        reminderTitle: "firstDummy"
    }, {
        status: 1,
        reminderID: 105,
        reminderTime: ["10", "22"],
        reminderTitle: "secondDummy"
    }, {
        status: 1,
        reminderID: 106,
        reminderTime: ["10", "23"],
        reminderTitle: "secondDummy"
    }, {
        status: 1,
        reminderID: 107,
        reminderTime: ["10", "24"],
        reminderTitle: "secondDummy"
    }, {
        status: 1,
        reminderID: 99,
        reminderTime: ["12", "23"],
        reminderTitle: "thirdDummy"
    }, {
        status: 0,
        reminderID: 102,
        reminderTime: ["13", "23"],
        reminderTitle: "fourthDummy"
    }, {
        status: 0,
        reminderID: 104,
        reminderTime: ["18", "23"],
        reminderTitle: "fifthDummy"
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
//     getReminderPositionFromID
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
    expect(getReminderPositionFromID(99, dummyArray)).toBe(4);
    expect(getReminderPositionFromID(104, dummyArray)).toBe(6);
    expect(getReminderPositionFromID(106, dummyArray)).toBe(2);
});

test("Getting position for value with bigger value", () => {
    const firstObject = {
        status: 0,
        reminderID: 1,
        reminderTime: ["5", "23"],
        reminderTitle: "firstObject"
    }
    const middleObject = {
        status: 0,
        reminderID: 14,
        reminderTime: ["11", "23"],
        reminderTitle: "MiddleObject"
    };
    const lastObject = {
        status: 0,
        reminderID: 1,
        reminderTime: ["19", "23"],
        reminderTitle: "lastObject"
    }
    expect(getPositionForBiggerValue(firstObject, dummyArray)).toBe(0);
    expect(getPositionForBiggerValue(middleObject, dummyArray)).toBe(4);
    expect(getPositionForBiggerValue(lastObject, dummyArray)).toBeNull();
});