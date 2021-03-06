const notifier = require('node-notifier');
const schedule = require('node-schedule');
const path = require('path');
const iconPath = path.join(__dirname, "../assets/images/logo_128.png");

//This file is for the needed classes for the app
class Reminder{
    #reminderID
    #time
    #title
    #hour
    #minutes
    #scheduler
    #status
    #callBack

    constructor ( {reminderID,  reminderTitle, reminderTime}, callback) {
        this.#reminderID = reminderID;
        this.#title = reminderTitle;
        this.#time = reminderTime;
        this.#status  = 1;
        this.#callBack = callback;
        this.updateTimeStructure();
        this.calculateStatus();
        this.createNewSceduler();
    }

    updateTimeStructure () {
        let splitting = this.#time;
        splitting = splitting.split(":");
        this.#hour = splitting[0]
        this.#minutes = splitting[1]
    }

    createNewSceduler () {
        if (this.#status) {return}
        this.#scheduler = null;
        this.#scheduler = new Scheduler(this.#title, this.#hour, 
                        this.#minutes, this.#time);
        this.#scheduler.scheduleReminderNotification(this.#reminderID, this.#callBack);
    }

    cancelReminderScheduled() {
        if (this.#scheduler != undefined) {
            this.#scheduler.cancelReminderScheduler();
        }
    }

    getTime() {
        return this.#time;
    }

    getDB_ID () {
        return this.#reminderID;
    }

    getStatus () {
        return this.#status;
    }

    setReminderNotified () {
        this.#status = 1;
    }

    // 1 - notified/expired, 0 - unfinished
    calculateStatus () {
        const dateObj = new Date();
        const current_H = dateObj.getHours();
        const current_M = dateObj.getMinutes();
        if (this.#hour >= current_H) {
            if (this.#hour == current_H && this.#minutes <= current_M) return
            this.#status = 0;
        }
    }
}

class Scheduler{
    #schedulerHandler
    #title
    #hour
    #minutes

    constructor (newTitle, newHour, newMinutes) {
        this.#title = newTitle;
        this.#hour = newHour;
        this.#minutes = newMinutes;
    }

    cancelReminderScheduler () {
        this.#schedulerHandler.cancel();
    }

    formatTimeTo12 (hour, minute) {
        hour = Number(hour);
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

    scheduleReminderNotification (reminderID, callback) {
        const dateObj = new Date();
        const year = dateObj.getFullYear();
        const month = dateObj.getMonth();
        const day = dateObj.getDate();
        const date = new Date(year, month, day, this.#hour, this.#minutes, 0);
        const title = this.#title
        this.#schedulerHandler = new schedule.scheduleJob(date, ()=>{
            notifier.notify({
                title: title,
                message: "Notification for " + title,
                appID: "My Little Reminder",
                icon: iconPath,
                sound: true
            },
                callback(reminderID)
            );
        });
    }
}

module.exports = {Reminder, Scheduler}

