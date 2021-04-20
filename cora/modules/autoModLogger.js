const fs = require('fs');

let offence = 'offence_placeholder', reason = 'reason_placeholder'
// temporary placeholders till feature is implemented.
let username = 'example_username'

let modlogdir = './logs/automod/'
let modlogfile = modlogdir+'automod_moderationlog.txt'

let date_ob = new Date();
// current date
// adjust 0 before single digit date
let date = ("0" + date_ob.getDate()).slice(-2);
// current month
let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
// current year
let year = date_ob.getFullYear();
// current hours
let hours = date_ob.getHours();
// current minutes
let minutes = date_ob.getMinutes();
// current seconds
let seconds = date_ob.getSeconds();
// checks if seconds less than or equal to '9'
if (seconds <= 9) {
  // formats seconds with 0 in front if true
  seconds = `0${seconds}`
}
var logdate = `${date}-${month}-${year}`
var logtime = `${hours}:${minutes}:${seconds}`
const template = `
Message from ${username} was removed at ${logdate} ${logtime}
Offence Type: ${offence}
Reason: ${reason}
`
//
fs.mkdir(modlogdir, {recursive: true}, function (err) {
    if (err) return;
});

function appendToLog() {
  fs.appendFile(modlogfile, template, function (err) {
    if (err) return console.error(err);
  })
}

fs.writeFile(modlogfile, template, { flag: 'wx' }, function (err) {
  if (err) appendToLog();
  console.log(`Saved log as ${modlogfile}!`)
})