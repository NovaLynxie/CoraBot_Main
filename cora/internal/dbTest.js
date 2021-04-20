const Database = require("@replit/database");
const wait = require('wait');
const db = new Database();
console.log("starting database selftest...");
(async () => {
  await wait(1000)
  db.set("key", "value").then(() => {console.log("added 'key' to db")});
  await wait(500)
  db.get("key").then(value => {console.log(`value of key is ${value}`)});
  await wait(500)
  db.delete("key").then(() => {console.log("removed 'key' from db")});
  await wait(1000)
  db.list().then(keys => {
    console.log(`found ${keys.length} keys!`)
    console.log(keys)
    keys.forEach(key => {
      db.get(key).then(value => console.log(value))
    });
    console.log(`parsed values of ${keys.length} keys`)
  })
  await wait(1000)
  console.log("completed selftest!");
})()
