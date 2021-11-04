const logger = require('./winstonLogger');
const fetch = require('node-fetch');
const minify = require('url-minify').default;

function validateURL (req) {
  return req.match(/(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/);
};

async function shortURL (url) {
  if (!validateURL(url)) return;
  let res;
  try {
    res = await minify(url, { provider: 'isgd' });
  } catch (err) {
    logger.error('Failed to resolve short URL!');
    logger.error(err.message); logger.debug(err.stack);
  };
  return res.shortUrl;
};
async function longURL (url) {
  if (!validateURL(url)) return;
  try {
    let res = await fetch(url);
  } catch (err) {
    logger.error('Failed to resolve long URL!');
    logger.error(err.message); logger.debug(err.stack);
  }
  logger.data(JSON.stringify(res));
  return res.url;
};

module.exports = { shortURL, longURL };