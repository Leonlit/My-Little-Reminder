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

    constructor ( {taskID,  taskTitle, taskTime}) {
        this.#taskID = taskID;
        this.#title = taskTitle;
        this.#time = taskTime;
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
        this.#scheduler = new Scheduler(this.#title, this.#hour, this.#minutes, this.#time);
    }

    getTime () {
        let str = " PM"
        if (this.#hour < 12) {
            str = " AM"
        }
        return `${this.#hour % 13}:${this.#minutes} ${str}`; 
                // in 12-hour format
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
        const dateObj = new Date();
        const today_H = dateObj.getHours();
        const today_M = dateObj.getMinutes()
        console.log(currTime, todayTime);
        if (this.today_H < today_H && this.#minutes < today_M) {
            console.log("");
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
        console.log("created the scheduler...");
    }

}

module.exports = {Task, Scheduler}