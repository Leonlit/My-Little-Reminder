//checking for the validation on the time format
// HH:MM Period while returning an object to the caller
//which consists of hour, minute and period
function checkTimeValidity (timeString) {
    timeString = timeString.replace(/\s/g, "");
    const timeArr = timeString.split(":");
    const secondSection = timeArr[1];
    const hour = timeArr[0];
    if (hour && secondSection) {
        const minute = secondSection.substring(0, secondSection.indexOf(/[PpAa]/));
        const timePeriod = secondSection.substring(2, secondSection.length);
        const isPeriodValid = checkTimePeriodValidity(timePeriod);
        if (!(minute.length > 2 || hour.length > 2 || minute > 59 ||
            hour > 12 || hour < 1 || minute < 0)) {
            if (isPeriodValid) {
                return {hour, minute, timePeriod};
            }
        }
    }
    return false;
}

//getting the current date with the format of yyyy-mm-dd
function getDate() {
    let today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return yyyy + "-" + mm + "-" + dd;
  }

//changing 24-hour format to a 12-hour time format
function getTimeFrom_24_format (timeArr) {
    if (!isTimeValid(timeArr[0], timeArr[1])) {
        return false;
    }
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

//formatting the time from 12-hour format to 24
//this is needed because during the editing of an
//item in the page
function formatTimeToFormat_24_Hour (hour, minute, timePeriod) {
    if (!checkTimePeriodValidity(timePeriod) || !isTimeValid(hour, minute)) return false;
    if (timePeriod.toLowerCase() == "pm") {
        if (hour < 12 ) {
            hour = Number(hour) + 12;
        }
    }else {
        if (hour == 12) {
            hour = 0;
        }
    }
    return `${`${hour}`.padStart(2, '0')}:${minute.padStart(2, '0')}`;
}

function isTimeValid(hour, minute) {
    console.log(hour, minute);
    return (((hour.length > 0 && hour.length < 3) && (minute.length > 0 && minute.length < 3)) &&
    (testNumeric(hour) && testNumeric(minute)))
}

function testNumeric (value) {
    return /^\d+$/.test(value);
}

function checkTimePeriodValidity (period) {
    period = period.toLowerCase();
    return period == "am" || period == "pm";
}

module.exports = {
    checkTimePeriodValidity,
    formatTimeToFormat_24_Hour,
    getTimeFrom_24_format,
    checkTimeValidity,
    getDate
}