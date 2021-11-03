const fetch = require('node-fetch');
const minify = require('url-minify');

function validateURL (req) {
  return req.match(/(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/);
};

async function shortURL (url) {
  if (!validateURL(url)) return;
  let res = await minify(url, { provider: 'isgd' });
  return res.shortUrl;
};
async function longURL (url) {
  if (!validateURL(url)) return;
  let res = await fetch(url);
  logger.data(JSON.stringify(res));
  return res;
};

module.exports = { shortURL, longURL };