const logger = require('../utils/winstonLogger');

module.exports = (data, client) => {
  let { shop, users } = data;
  function checkFunds(a, b) { return a > b };
  function addFunds() {
    // ..
  };
  function deductFunds() {
    // ..
  };
  function transferFunds() {
    // ..
  };
  function addItem() {
    // ..
  };
  function removeItem() {
    // ..
  };
  return data;
};