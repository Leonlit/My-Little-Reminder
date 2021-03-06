const sqlite3 = require('sqlite3');

class DBManagement {
    #SQLiteObj

    constructor (path) {
        this.#SQLiteObj = new sqlite3.Database(path, err=> {
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
                reminderID INTEGER PRIMARY KEY AUTOINCREMENT,
                reminderTitle TEXT NOT NULL,
                reminderTime TEXT NOT NULL,
                reminderDate TEXT NOT NUll
            )
        `;
        try {
            this.#SQLiteObj.run(query, [], err=>{
                if (err) {
                    console.log(`error when trying to make sure database table is present ${err}`);
                }else {
                    console.log("table for database created or already exists");
                }
                this.clearPreviousDateReminder();
            });
        } catch (error) {
            console.log(error);
        }
    }

    clearPreviousDateReminder () {
        const query = `DELETE FROM TASKS WHERE reminderDate < Date("now")`;
        this.#SQLiteObj.run(query, function(err) {
            if (err) {
                console.log(`Error occured when deleting reminder created on previous date.`);
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

    getAllReminder (callback) {
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

    insertReminder (title, time, date, callback) {
        const query = `INSERT INTO TASKS (reminderTitle, reminderTime, reminderDate) VALUES (?, ?, ?)`;
        this.#SQLiteObj.run(query, [title, time, date], err=> {
            if (err) {
                console.log(`could not insert reminder info into database, ${err}`);
            }else {
                console.log("succesfully inserted reminder into database");
                this.#SQLiteObj.get("SELECT LAST_INSERT_ROWID()",(err, ID)=>{
                    if (err) {
                        console.log(`could not get last inserted ID from DB, ${err}`);
                    }else {
                        const timeArr = time.split(":");
                        callback({reminderID: ID["LAST_INSERT_ROWID()"], reminderTitle: title, reminderTime: time}, timeArr);
                    }
                })
            }
            return false;
        })
    }

    updateReminderInfo(reminderObj, callback) {
        const query = `UPDATE TASKS SET reminderTitle=?, reminderTime=? WHERE reminderID=?`;
        this.#SQLiteObj.run(query, [reminderObj.reminderTitle, reminderObj.reminderTime, reminderObj.reminderID], err=> {
            if (err) {
                console.log(`could not insert reminder info into database, ${err}`);
            }else {
                console.log("succesfully updated reminder info in database.");
                callback(reminderObj)
            }
            return false;
        })
    }

    deleteReminder(reminderID, callback) {
        const query = `DELETE FROM TASKS WHERE reminderID=?`;
        this.#SQLiteObj.run(query, [reminderID], function (err) {
            if (err) {
                console.log(`could not delete reminder from database, ${err}`);
            }else if (this.changes == 1){
                console.log("succesfully deleted reminder from database.");
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