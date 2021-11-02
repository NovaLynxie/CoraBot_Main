const request = require('request');
const minify = require('url-minify');

function validateURL (req) {
  return req.match(/(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/);
};

function shortURL (url) {
  if (!validateURL(url)) return;
};
function longURL (url) {
  if (!validateURL(url)) return;
};

module.exports = { shortURL, longURL };