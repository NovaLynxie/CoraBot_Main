const fs = require('fs');
const path = require('path');
const prompt = require('prompt');

console.log('Running Log CleanUp v1.0')

const logFilePaths = [
  "./logs/",
  "./logs/automod-reports/",
  "./logs/crash-reports/"  
]

const properties = [
    {
        name: 'option',
        validator: /^[1-3]+$/,
        warning: 'Invalid Option! Please choose option between 1-3.'
    }
];

prompt.start();

function fileHandler(dir) {
  fs.readdir(dir, (err, files) => {
    if (err) throw err;
    for (const file of files) {
      console.log(`Trying to remove ${file}...`)
      fs.unlink(path.join(dir, file), err => {
        if (err) /*throw err;*/ {
          if (err.errno === -21) return console.log(`Skipping ${file} as this is a directory.`);
        }
        console.log(`Removed ${file} successfully!`)
      });
    }
  });
};

prompt.get(properties, function (err, result) {
  if (err) { return onErr(err); }
  switch (result.option) {
    case '1': 
      console.log(`Removing log files in 'logs' directory.`)
      fileHandler(logFilePaths[0]);
      break;
    case '2': 
      console.log(`Removing log files in 'automod-reports' directory.`)
      fileHandler(logFilePaths[1]);
      break;
    case '3': 
      console.log(`Removing log files in 'crash-reports' directory.`)
      fileHandler(logFilePaths[2]);
      break;
    /*
    case 4: 
      console.log(`Removing log files in all directories.`)
      break;
    */
    default:
      console.log('Invalid option provided! Aborting process.')
  }
});

function onErr(err) {
    console.log(err);
    return 1;
}