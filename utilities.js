const notifier = require('node-notifier');
const schedule = require('node-schedule');

class Task{
    #time
    #title
    #hour
    #minutes
    #scheduler

    constructor (title, time) {
        this.#title = title
        this.#time = time
        this.updateTimeStructure();
        this.createNewSceduler();
    }

    updateTimeStructure () {
        let splitting = this.#time;
        console.log(this.#time);
        splitting = splitting.split(":");
        this.#hour = splitting[0]
        this.#minutes = splitting[1]
    }

    createNewSceduler () {
        this.#scheduler = null;
        this.#scheduler = new Scheduler(this.#title, this.#hour, this.#minutes, this.getTime());
        console.log(this.#scheduler);
    }

    getTime () {
        let str = " PM"
        if (this.getHour() < 12) {
            str = " AM"
        }
        return this.#time % 13 + str; // in 12-hour format
    }

    getTitle () {
        return this.#title
    }

    getHour() {
        return this.#hour;
    }

    getMinute() {
        return this.#minutes;
    }
    
    getScheduleState () {
        return this.#scheduler.state;
    }

    //change time to a new one
    changeTime(newTime) {
        this.#time = newTime;
        updateTimeStructure();
        resetScheduler();
    }
    
    //used when user decided to change the title
    changeTitle(newTitle) {
        this.#title = newTitle;
        resetScheduler();
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
    #time

    constructor (newTitle, newHour, newMinutes, newTime) {
        console.log("created a scheduler");
        this.#title = newTitle;
        this.#hour = newHour;
        this.#minutes = newMinutes;
        this.#time = newTime;
        this.state = 0;
        this.scheduleTaskNotification();
    }

    cancelTaskScheduler () {
        this.#schedulerHandler.cancel();
    }

    scheduleTaskNotification () {
        const dateObj = new Date();
        const year = dateObj.getFullYear();
        const month = dateObj.getMonth();
        const day = dateObj.getDate();
        const date = new Date(year, month, day, this.#hour, this.#minutes, 0);
        console.log(year, month, day, this.#hour, this.#minutes, date);
        const title = this.#title
        const time = this.#time
        this.#schedulerHandler = new schedule.scheduleJob(date, function(){
            notifier.notify({
                title: title,
                message: time,
            });
            this.state = 1;
        });
        console.log("created scheduler");
    }

}

module.exports = {Task, Scheduler}