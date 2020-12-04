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
    }

    getTime () {
        let str = " PM"
        if (this.getHour() < 12) {
            str = " AM"
        }
        return this.#time + str;
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

    //change time to a new one
    changeTime(newTime) {
        this.#time = newTime;
        cancelScheduler();
        updateTimeStructure();
        scheduleTaskNotification();
    }

    changeTitle(newTitle) {
        this.#title = newTitle;
        cancelScheduler();
        scheduleTaskNotification();
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
        this.#title = newTitle;
        this.#hour = newHour;
        this.#minutes = newMinutes;
        this.#time = newTime;
        this.scheduleTaskNotification();
    }

    cancelTaskScheduler () {
        this.#schedulerHandler.cancel();
    }

    scheduleTaskNotification () {
        const dateObj = this.convertTZ(new Date(), "Asia/Kuala_Lumpur");
        const year = dateObj.getFullYear();
        const month = dateObj.getMonth();
        const day = dateObj.getDay() - 1;
        const date = new Date(year, month, day, this.#hour, this.#minutes, 0);
        const title = this.#title
        const time = this.#time
        this.#schedulerHandler = schedule.scheduleJob(date, function(){
            notifier.notify({
                title: "" + title,
                message: "" + time,
            },
            function (err, response) {
                console.log(err, response)
            });
        });
        console.log(this.#schedulerHandler);
    }
    convertTZ(date, tzString) {
        return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {timeZone: tzString}));   
    }
}

module.exports = {Task, Scheduler}