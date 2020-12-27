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
            });
        } catch (error) {
            console.log(error);
        }
    }

    getSingleTask(taskID){
        const query = `SELECT * FROM TASKS WHERE taskID=?`;
        this.#SQLiteObj.get(query, [taskID,], (err, row)=>  {
            if (err) {
                console.log(`Error occured when getting Task info for item ID ${taskID}, ${err}`);
                return false;
            }else {
                return row;     //returning single object
            }
        });
    }

    getAllTask (callback) {
        const query = `SELECT * FROM TASKS`;
        this.#SQLiteObj.all(query, (err, row)=>  {
            if (err) {
                console.log(`Error occured when retrieving all records from database`);
                return callback(false);
            }else {
                return callback(row);     //returning arraay of objects
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
                        callback({taskID: ID["LAST_INSERT_ROWID()"], taskTitle: title, taskTime: time, taskStatus: 0}, timeArr);
                    }
                })
            }
            return false;
        })
    }

    updateTaskInfo(taskID, taskNewTitle, taskNewTime) {
        const query = `UPDATE TASKS SET taskTitle=?, taskTime=? WHERE taskID=?)`;
        this.#SQLiteObj.run(query, [taskNewTitle, taskNewTime, taskID], err=> {
            if (err) {
                console.log(`could not insert task info into database, ${err}`);
            }else {
                console.log("succesfully updated task info in database.");
                return true;
            }
            return false;
        })
    }

    deleteTask(taskID, callback) {
        const query = `DELETE FROM TASKS WHERE taskID=?`;
        this.#SQLiteObj.run(query, [taskID], function (err) {
            console.log(this.changes);
            if (err) {
                console.log(`could not delete task from database, ${err}`);
            }else if (this.changes == 1){
                console.log("succesfully deleted task from database.");
                console.log(this.changes);
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