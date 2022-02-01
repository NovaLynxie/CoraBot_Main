const logger = require('../utils/winstonLogger');

module.exports = async (client, mode, data) => {
  let economy = {
    shop: await client.economy.shop.get(guild, 'shop'),
    users: await client.economy.shop.get(guild, 'users')
  };
  let { amount = 0, itemId, targetId = undefined, executorId } = data, item, user;
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
    } else {
      logger.debug('Insufficient funds to complete purchase!')
      return 'INSUFFICIENT_FUNDS'
    };
  };
  function sellItem(userId) {
    user = fetchUser(economy.users, userId);
    if (!user) return logger.debug('That user could not be found or does not exist!');
    item = fetchItem(user.items, itemId);
    if (!item) return logger.debug(`No item was found with ID:${itemId}!`);
    addFunds(executorId);
  };
  async function updateEconomyData() {
    await client.economy.set(guild, 'shop', economy.shop);
    await client.economy.set(guild, 'users', economy.users);
  };
  switch (mode) {
    case 'add':
      addFunds(executorId);
      break;
    case 'deduct':
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
  await updateEconomyData(); return economy;
};