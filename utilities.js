const notifier = require('node-notifier');
const schedule = require('node-schedule');

class Task{
    #taskID
    #time
    #title
    #hour
    #minutes
    #scheduler
    #status
    #date

    constructor ( {taskID,  taskTitle, taskTime, taskDate}) {
        this.#taskID = taskID;
        this.#title = taskTitle;
        this.#time = taskTime;
        this.#date = taskDate;
        this.#status  = 0;
        this.calculateStatus();
        this.updateTimeStructure();
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
        this.#scheduler = new Scheduler(this.getTitle(), this.#hour, this.#minutes, this.getTime());
    }

    getTime () {
        let str = " PM"
        if (this.getHour() < 12) {
            str = " AM"
        }
        return `${this.getHour() % 13}:${this.getMinute()} ${str}`; 
                // in 12-hour format
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

    getDB_ID () {
        return this.#taskID;
    }

    getStatus () {
        return this.#status;
    }

    // 1 - done/expired, 0 - unfinished
    calculateStatus () {
        const date = new Date(this.#date).getDate();
        const todayDate = new Date().getDate();
        if (date < todayDate) {
            this.#status = 1;
        }

        // calculate status 
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
        const title = this.#title
        const time = this.#time
        console.log(time);
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