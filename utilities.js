const notifier = require('node-notifier');
const schedule = require('node-schedule');

class Task{
    #taskDB_ID
    #time
    #title
    #hour
    #minutes
    #scheduler
    #status

    constructor ( {taskDB_ID,  taskTitle, taskTime, taskStatus}) {
        this.#taskDB_ID = taskDB_ID;
        this.#title = taskTitle;
        this.#time = taskTime;
        this.#status = taskStatus;
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
        this.#scheduler = null;
        this.#scheduler = new Scheduler(this.#title, this.#hour, this.#minutes, this.getTime());
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
        return this.#taskDB_ID;
    }

    getStatus () {
        return this.#status;
    }

    // 1 - done, 0 - unfinished
    setNewStatus (newStatus) {
        this.#status = newStatus;
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