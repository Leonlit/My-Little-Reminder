const notifier = require('node-notifier');
// String

var schedule = require('node-schedule');
var date = new Date(2020, 11, 3, 15, 30, 0);

var j = schedule.scheduleJob(date, function(){
    notifier.notify('Message');
    
    // Object
    notifier.notify({
    title: 'My notification',
    message: 'Hello, there!'
    });
});
