const logger = require('../providers/WinstonPlugin');
//const { responses } = require('../assets/json/responses.json');
const {assets} = require('../handlers/bootLoader');
const {responses} = assets;

module.exports = function autoRespond(message) {
  logger.debug('fetching responses list...  ')
  logger.data(responses);
  if (!responses||responses==undefined||responses==null){
    // Warns user if responses was not loaded correctly.
    logger.warn('The responses variable is undefined or missing!')
    logger.warn('Module autoResponder.js may fail to work correctly!')
  }
  try {
    logger.debug(`typeof responses: ${typeof responses}`)
    logger.debug(`loaded ${Object.keys(responses).length} responses`)
    let input = message.content; // gets message content and stores as input variable   for easy execution.
    logger.debug(`message.content => ${input}`)
    input = input.toLowerCase(); // inputs must be in lowercase to parse correctly.
    let output = responses[input]
    if (output == undefined) {
        logger.debug(`output returned as undefined! ignoring message.`)
        return;
    } 
    logger.debug(`typeof ${typeof output} => output=${output}`)
    return message.channel.send(output);
  } catch (error) {
    logger.error('Error occured in function autoRespond in module autoResponder.js!')
    logger.error(error.stack);
  }
}