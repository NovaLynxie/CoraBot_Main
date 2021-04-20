const fs = require('fs');

console.log('Running File SelfTest v1.2')

const coreFilepaths = [
  "./cora/handlers/bootLoader.js",
  "./cora/handlers/serverRegion.js",
  "./cora/modules/autoModerator.js",
  "./cora/modules/autoResponder.js",
  "./cora/providers/WinstonPlugin.js"
]

const dataFilepaths = [
  "./cora/assets/img/",
  "./cora/assets/json/",
  "./cora/cache/automod",
  "./cora/cache/mcsrvutil",
  "./logs/",
  "./logs/automod-reports/",
  "./logs/crash-reports/"
]

// Checks if necessary files do exist in the bot's directory.
console.log('Checking bot core files exist...')
try {
  coreFilepaths.forEach(filepath => {
    fs.accessSync(filepath, fs.constants.F_OK);
    console.log(`${filepath} exists ok!`);
  });
  console.log('All core files verified as exists ok!')
} catch (err) {
  console.error('Unable to find file/directory at specified path!');
  console.error(err);
}

setTimeout(() => {
  console.log()
}, 5000);

// Checks if files can be read and written to.
console.log('Checking read/write access of data folders...')
try {
  dataFilepaths.forEach(filepath => {
    fs.accessSync(filepath, fs.constants.R_OK | fs.constants.W_OK);
    console.log(`${filepath} has read/write permissions!`)
  });
  console.log('Data Filepaths read/write permissions ok!')
} catch (err) {
  console.error('One or more files are missing read/write permissions!');
  console.error(err);
}