const sqlite3 = require('sqlite3');

class DBManagement {
    #SQLiteObj

    constructor () {
        this.#SQLiteObj = new sqlite3.Database('./tasks.db', err=> {
            if (err) {
                console.log("Could not connect to database", err);
            }else {
                console.log("connected to database");
            }
        });
        this.makeSureTableIsPresent();
    }

    makeSureTableIsPresent () {
        const query = `
            CREATE TABLE IF NOT EXISTS TASKS (
                taskID INTEGER PRIMARY KEY AUTOINCREMENT,
                taskTitle TEXT NOT NULL,
                taskTime TEXT NOT NULL,
                taskDate TEXT NOT NUll
            )
        `;
        try {
            this.#SQLiteObj.run(query, [], err=>{
                if (err) {
                    console.log(`error when trying to make sure database table is present ${err}`);
                }else {
                    console.log("table for database created or already exists");
                }
                this.clearPreviousDateTask();
            });
        } catch (error) {
            console.log(error);
        }
    }

    clearPreviousDateTask () {
        const query = `DELETE FROM TASKS WHERE taskDate < Date("now")`;
        this.#SQLiteObj.run(query, function(err) {
            if (err) {
                console.log(`Error occured when deleting task created on previous date.`);
                return false;
            }else {
                if (this.changes > 0) {
                    console.log(`Deleted ${this.changes} row(s)`);
                    return
                }else {
                    console.log("No row is deleted");
                }
                
            }
        });
    }

    clearAll(callback) {
        const query = `DELETE FROM TASKS`;
        this.#SQLiteObj.all(query, (err)=>  {
            if (err) {
                console.log(`Error occured when clearing all records from database`);
                return callback(false);
            }else {
                return callback();
            }
        })
    }

    getAllTask (callback) {
        const query = `SELECT * FROM TASKS`;
        this.#SQLiteObj.all(query, (err, row)=>  {
            if (err) {
                console.log(`Error occured when retrieving all records from database`);
                return callback(false);
            }else {
                return callback(row);     //returning array of objects
            }
        })
    }

    insertTask (title, time, date, callback) {
        const query = `INSERT INTO TASKS (taskTitle, taskTime, taskDate) VALUES (?, ?, ?)`;
        this.#SQLiteObj.run(query, [title, time, date], err=> {
            if (err) {
                console.log(`could not insert task info into database, ${err}`);
            }else {
                console.log("succesfully inserted task into database");
                this.#SQLiteObj.get("SELECT LAST_INSERT_ROWID()",(err, ID)=>{
                    if (err) {
                        console.log(`could not get last inserted ID from DB, ${err}`);
                    }else {
                        const timeArr = time.split(":");
                        callback({taskID: ID["LAST_INSERT_ROWID()"], taskTitle: title, taskTime: time}, timeArr);
                    }
                })
            }
            return false;
        })
    }

    updateTaskInfo(taskObj, callback) {
        const query = `UPDATE TASKS SET taskTitle=?, taskTime=? WHERE taskID=?`;
        this.#SQLiteObj.run(query, [taskObj.taskTitle, taskObj.taskTime.trim(), taskObj.taskID], err=> {
            if (err) {
                console.log(`could not insert task info into database, ${err}`);
            }else {
                console.log("succesfully updated task info in database.");
                callback(taskObj)
            }
            return false;
        })
    }

    deleteTask(taskID, callback) {
        const query = `DELETE FROM TASKS WHERE taskID=?`;
        this.#SQLiteObj.run(query, [taskID], function (err) {
            if (err) {
                console.log(`could not delete task from database, ${err}`);
            }else if (this.changes == 1){
                console.log("succesfully deleted task from database.");
                callback();
                return true;
            }else {
                console.log("The item does not exists.");
            }
            return false;
        })
    }
}

module.exports= {DBManagement}