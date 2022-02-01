const logger = require('../utils/winstonLogger');
const uuid = require('uuid');

let data, item, user;

const checkFunds = (a, b) => a > b;
const fetchItem = (items, itemId) => items.find(item => item.id === itemId);
const fetchUser = (users, userId) => users[userId];

function addFunds(userId) {
  user = fetchUser(economy.users, userId);
  if (!user) return logger.debug('That user could not be found or does not exist!');
  user.balance = user.balance + amount;
  economy.users[userId].balance = user.balance;
};
function deductFunds(userId) {
  user = fetchUser(economy.users, userId);
  if (!user) return logger.debug('That user could not be found or does not exist!');
  user.balance = checkFunds(user.balance, amount) ? user.balance - amount : user.balance;
  economy.users[userId].balance = user.balance;
};
function buyItem(userId) {
  user = fetchUser(economy.users, userId);
  if (!user) return logger.debug('That user could not be found or does not exist!');
  item = fetchItem(shop.items, itemId);
  if (!item) return logger.debug(`No item was found with ID:${itemId}!`);
  if (checkFunds(user.balance, item.cost)) {
    deductFunds(userId);
    return 'SUCCESS_PURCHASE_COMPLETE';
  } else {
    logger.debug('Insufficient funds to complete purchase!');
    return 'ERROR_INSUFFICIENT_FUNDS';
  };
};
function sellItem(userId) {
  user = fetchUser(economy.users, userId);
  if (!user) return logger.debug('That user could not be found or does not exist!');
  item = fetchItem(user.items, itemId);
  if (!item) return logger.debug(`No item was found with ID:${itemId}!`);
  addFunds(executorId); return 'SUCCESS_SALE_COMPLETE';
};

module.exports.econ = {
  buy: buyItem, sell: sellItem,
  funds: { add: addFunds, deduct: deductFunds }
};

// DEPRECATED CODE! DO NOT USE!
module.exports = async (client, mode, data) => {
  let response = {
    message: 'economy.message',
    status: 'economy.status'
  }
  let economy = {
    shop: await client.economy.shop.get(guild, 'shop'),
    users: await client.economy.shop.get(guild, 'users')
  };
  let { amount = 0, itemData, itemId, targetId = undefined, executorId } = data, item;
  if (!executorId || typeof executorId !== 'string') throw new Error(`UserError! Missing or Invalid User ID!`);
  if (typeof amount !== 'number') throw new Error(`INVALID INPUT! Expected 'amount' to be NUMBER, got '${typeof amount}'!`);
  function validateUserIds() {
    if (executorId) {
      if (typeof executorId !== 'string') {
        throw new Error(`INVALID EXECUTOR USER ID! Expected 'string', got ${typeof executorId} instead!`);
      } else { return true };
    } else {
      throw new Error(`MISSING USER ID! This parameter is undefined or null, should be provided!`);
    };
    if (targetId) {
      if (typeof targetId !== 'string') {
        throw new Error(`INVALID TARGET USER ID! Expected 'string', got ${typeof targetId} instead!`);
      } else { return true };
    } else { return false };
  };
  const fetchItem = (items, itemId) => items.find(item => item.id === itemId);
  const fetchUser = (users, userId) => users[userId];
  function checkFunds(a, b) { return a > b };
  function addFunds(userId) {
    user = fetchUser(economy.users, userId);
    if (!user) return logger.debug('That user could not be found or does not exist!');
    user.balance = user.balance + amount;
    economy.users[userId].balance = user.balance;
  };
  function deductFunds(userId) {
    user = fetchUser(economy.users, userId);
    if (!user) return logger.debug('That user could not be found or does not exist!');
    user.balance = checkFunds(user.balance, amount) ? user.balance - amount : user.balance;
    economy.users[userId].balance = user.balance;
  };
  function buyItem(userId) {
    user = fetchUser(economy.users, userId);
    if (!user) return logger.debug('That user could not be found or does not exist!');
    item = fetchItem(shop.items, itemId);
    if (!item) return logger.debug(`No item was found with ID:${itemId}!`);
    if (checkFunds(user.balance, item.cost)) {
      deductFunds(userId); return 'SUCCESS';
      response.message = 'Purchase was successful!';
      response.status = 'SUCCESS_PURCHASE_COMPLETE';
    } else {
      logger.debug('Insufficient funds to complete purchase!');
      response.message = 'You do not have enough money to complete the purchase!';
      response.status = 'ERROR_INSUFFICIENT_FUNDS';
    };
  };
  function sellItem(userId) {
    user = fetchUser(economy.users, userId);
    if (!user) return logger.debug('That user could not be found or does not exist!');
    item = fetchItem(user.items, itemId);
    if (!item) return logger.debug(`No item was found with ID:${itemId}!`);
    addFunds(executorId);
    response.message = 'Items sold successfully!';
    response.status = 'SUCCESS_SALE_COMPLETE';
  };
  async function updateEconomyData() {
    await client.economy.set(guild, 'shop', economy.shop);
    await client.economy.set(guild, 'users', economy.users);
  };
  function validateItemData(data) {
    if (!data.name || !data.cost) {
      return false;
    } else {
      if (typeof data.name !== 'string') return false;
      if (typeof data.cost !== 'number') return false;
      return true;
    };
  };
  switch (mode) {
    case 'add_item':
      if (!itemData) {
        response.message = 'Missing item data to add to shop listings!';
        response.status = 'ERROR_NO_ITEM_DATA';
      } else {
        if (typeof itemData !== 'object') {
          throw new Error(`Invalid parameter 'itemData'! Expected 'object', got ${typeof itemData} instead!`);
        } else if (validateItemData(itemData)) {
          response.message = 'Some data parameters were missing or were  invalid.';
          response.status = 'ERROR_ITEM_REJECTED';
          break;
        } else {
          itemData.id = uuid.v1().substr(0, 8);
          economy.shop.items.push(itemData);
          response.message = 'Added item successfully to shop!';
          response.status = 'SUCCESS_ITEM_ADDED';
        };
      };
      break;
    case 'remove_item':
      let itemIndex = economy.shop.items.findIndex(item => item.id === itemId);
      if (itemIndex > 0) {
        response.message = 'Missing item data to add to shop listings!';
        response.status = 'ERROR_NO_ITEM_DATA';
      } else {
        economy.shop.items.splice(itemIndex, 1);
      };
      break;
    case 'add_funds':
      addFunds(executorId);
      break;
    case 'deduct_funds':
      deductFunds(executorId);
      break;
    case 'buy':
      buyItem(itemId, executorId);
      break;
    case 'sell':
      sellItem(itemId, executorId);
      break;
    case 'transfer':
      let transfer = deductFunds(executorId);
      if (!transfer) break; addFunds(targetId);
      break;
    case 'view_bank':
      break;
    case 'view_shop':
      break;
    default:
      logger.debug(`Unrecognised method '${mode}'!`);
      throw new Error(`Invalid mode provided! Unknown mode state ${mode}!`);
  };
  await updateEconomyData(); return { economy, response };
};
// DEPRECATED CODE! DO NOT USE!