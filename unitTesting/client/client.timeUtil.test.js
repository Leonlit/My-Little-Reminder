const {
    checkTimePeriodValidity,
    formatTimeToFormat_24_Hour,
    getTimeFrom_24_format,
    checkTimeValidity,
    getDate,
    isTimeValid,
    testPositiveNumeric
} = require("../../app/modules/timeUtil.js");

//
//  Testing time util functions in the timeUtil file
//  function covered:
//  
//     checkTimeValidity
//     formatTimeToFormat_24_Hour
//     getTimeFrom_24_format
//     checkTimePeriodValidity
//     getDate

test("Time validaton algorithm working correctly.", ()=>{

    const invalidPeroidWithSpaces = "11 : 12 sm";
    const invalidPeriod = "11:21sm";
    
    expect(checkTimeValidity(invalidPeriod)).toBeFalsy();
    expect(checkTimeValidity(invalidPeroidWithSpaces)).toBeFalsy();

    const validPM = "11:12pm";
    const validAM = "11:12am";
    const validWithSpacePM = "11:12 pm";
    const validWithSpaceAM = "11:12 am";
    const validCapsPM = "11:12 PM";
    const validCapsAM = "11:12 AM";
    const validPeriodWithSpacesPM = "11 : 12 pm";
    const validPeriodWithSpacesAM = "11 : 12 am";

    expect(checkTimeValidity(validPM)).toEqual({"hour": "11", "minute": "12", "timePeriod": "PM"});
    expect(checkTimeValidity(validAM)).toEqual({"hour": "11", "minute": "12", "timePeriod": "AM"});
    expect(checkTimeValidity(validWithSpacePM)).toEqual({"hour": "11", "minute": "12", "timePeriod": "PM"});
    expect(checkTimeValidity(validWithSpaceAM)).toEqual({"hour": "11", "minute": "12", "timePeriod": "AM"});
    expect(checkTimeValidity(validCapsPM)).toEqual({"hour": "11", "minute": "12", "timePeriod": "PM"});
    expect(checkTimeValidity(validCapsAM)).toEqual({"hour": "11", "minute": "12", "timePeriod": "AM"});
    expect(checkTimeValidity(validPeriodWithSpacesPM)).toEqual({"hour": "11", "minute": "12", "timePeriod": "PM"});
    expect(checkTimeValidity(validPeriodWithSpacesAM)).toEqual({"hour": "11", "minute": "12", "timePeriod": "AM"});

    const timeInvalidTooBig = "13:21pm"
    const timeInvalidTooSmall = "-1:21pm";
    const stringInsteadOfTime = "test";
    const invalidCharacter1 = "11-21pm";
    const invalidCharacter2 = "11 21pm";
    const invalid12PM = "0:10pm";
    const invalid12AM = "0:10am";
    
    expect(checkTimeValidity(timeInvalidTooBig)).toBeFalsy();
    expect(checkTimeValidity(timeInvalidTooSmall)).toBeFalsy();
    expect(checkTimeValidity(stringInsteadOfTime)).toBeFalsy();
    expect(checkTimeValidity(invalidCharacter1)).toBeFalsy();
    expect(checkTimeValidity(invalidCharacter2)).toBeFalsy();
    expect(checkTimeValidity(invalid12PM)).toBeFalsy();
    expect(checkTimeValidity(invalid12AM)).toBeFalsy();

    const valid12PM = "12:00pm";
    const valid12AM = "12:00am";

    expect(checkTimeValidity(valid12PM)).toEqual({"hour": "12", "minute": "00", "timePeriod": "PM"});
    expect(checkTimeValidity(valid12AM)).toEqual({"hour": "12", "minute": "00", "timePeriod": "AM"});
});

test("Formatting time from 12-hour format to 24-hour format working", ()=>{
    
    expect(formatTimeToFormat_24_Hour("12", "00", "AM")).toBe("00:00");     //morning
    expect(formatTimeToFormat_24_Hour("6", "00", "AM")).toBe("06:00");
    expect(formatTimeToFormat_24_Hour("12", "00", "PM")).toBe("12:00");     //afternoon
    expect(formatTimeToFormat_24_Hour("5", "10", "pM")).toBe("17:10");      //evening
    expect(formatTimeToFormat_24_Hour("11", "23", "pM")).toBe("23:23");     //night
    expect(formatTimeToFormat_24_Hour("12", "00", "sM")).toBeFalsy();     //false
});

test("Getting time from 24-hour format to 12-hour format working", ()=>{
    expect(getTimeFrom_24_format(["00","00"])).toBe("12:00 AM");     //another splendid day
    expect(getTimeFrom_24_format(["6","24"])).toBe("6:24 AM");     //morning
    expect(getTimeFrom_24_format(["12","00"])).toBe("12:00 PM");     //afternoon
    expect(getTimeFrom_24_format(["17","10"])).toBe("5:10 PM");      //evening
    expect(getTimeFrom_24_format(["23","23"])).toBe("11:23 PM");     //night
    expect(getTimeFrom_24_format(["ss","ss"])).toBeFalsy();     //not a number
    expect(getTimeFrom_24_format(["11","111"])).toBeFalsy();    //invalid minute number lenght
    expect(getTimeFrom_24_format(["111","11"])).toBeFalsy();    //invalid hour number length
});

test("Time period checks working", ()=>{
    expect(checkTimePeriodValidity("Am")).toBeTruthy();
    expect(checkTimePeriodValidity("aM")).toBeTruthy();
    expect(checkTimePeriodValidity("Pm")).toBeTruthy();
    expect(checkTimePeriodValidity("pM")).toBeTruthy();
    expect(checkTimePeriodValidity("sm")).toBeFalsy();
    expect(checkTimePeriodValidity("12")).toBeFalsy();
})

test("Date function return correct date format yyyy-mm-dd", ()=>{
    const currDate = getDate();
    const dateSection = currDate.split("-");
    expect(dateSection[0]).toMatch(/[0-9]{4}/);
    expect(dateSection[1]).toMatch(/[1-11]/);
    expect(dateSection[2]).toMatch(/[1-31]/);
});

test("Time validation working correctly", ()=>{
    expect(isTimeValid("00","00")).toBeTruthy();
    expect(isTimeValid("6","24")).toBeTruthy();  
    expect(isTimeValid("12","00")).toBeTruthy();
    expect(isTimeValid("17","10")).toBeTruthy(); 
    expect(isTimeValid("23","23")).toBeTruthy();
    expect(isTimeValid("ss","ss")).toBeFalsy();
    expect(isTimeValid("11","111")).toBeFalsy();
    expect(isTimeValid("111","11")).toBeFalsy(); 
});

test("Validation for numeric value working correctly",()=>{
    expect(testPositiveNumeric("00")).toBeTruthy();
    expect(testPositiveNumeric("12")).toBeTruthy();
    expect(testPositiveNumeric("6")).toBeTruthy();
    expect(testPositiveNumeric("-1")).toBeFalsy();
    expect(testPositiveNumeric("1s")).toBeFalsy();
    expect(testPositiveNumeric("s")).toBeFalsy();
    expect(testPositiveNumeric("s0")).toBeFalsy();
    expect(testPositiveNumeric("ss")).toBeFalsy();
})