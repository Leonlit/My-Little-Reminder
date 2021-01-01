const notifier = require('node-notifier');
const schedule = require('node-schedule');
const path = require('path');

class Task{
    #taskID
    #time
    #title
    #hour
    #minutes
    #scheduler
    #status
    #callBack

    constructor ( {taskID,  taskTitle, taskTime}, callback) {
        this.#taskID = taskID;
        this.#title = taskTitle;
        this.#time = taskTime;
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
        this.#scheduler.scheduleTaskNotification(this.#taskID, this.#callBack);
    }

    cancelTaskScheduled() {
        console.log(this.#scheduler);
        if (this.#scheduler != undefined) {
            this.#scheduler.cancelTaskScheduler();
        }
    }

    getTime() {
        return this.#time;
    }

    getDB_ID () {
        return this.#taskID;
    }

    getStatus () {
        return this.#status;
    }

    setTaskNotified () {
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
        console.log(this.#status);
    }

    resetScheduler () {
        this.#scheduler.cancelTaskScheduler();
        createNewSceduler();
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
        this.state = 0;
    }

    cancelTaskScheduler () {
        this.#schedulerHandler.cancel();
    }

    scheduleTaskNotification (taskID, callback) {
        const dateObj = new Date();
        const year = dateObj.getFullYear();
        const month = dateObj.getMonth();
        const day = dateObj.getDate();
        const date = new Date(year, month, day, this.#hour, this.#minutes, 0);
        const title = this.#title
        this.#schedulerHandler = new schedule.scheduleJob(date, ()=>{
            notifier.notify({
                title: title,
                message: `${this.#hour}:${this.#minutes}`,
                icon: path.join(__dirname, "/assets/logo_128.png"),
                sound: true
            },
                callback(taskID)
            );
        });
        console.log("created the scheduler...");
    }
}

module.exports = {Task, Scheduler}