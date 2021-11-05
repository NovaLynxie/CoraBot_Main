const logger = require('../plugins/winstonLogger');
const path = require('path');

const dashDir = path.resolve(`${process.cwd()}/core/dashboard`);
const viewsDir = path.resolve(`${dashDir}/views/`);

function checkAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    logger.debug(`req.url='${req.url}'`);
    req.session.backURL = req.url; res.status(401);
    req.flash('info', 'Login expired. You have been signed out.');
    logger.debug(`req.session.backURL='${req.session.backURL}'`);
    res.redirect('/login');
  };
};
function isManaged(guild, dashuser) {
  const member = guild.members.cache.get(dashuser.id);
  const res = member.permissions.has('MANAGE_GUILD');
  return res;
};

function fetchBreadcrumbs(url) {
  let rtn = [{ name: 'HOME', url: '/' }], acc = '', arr = url.substring(1).split('/');
  for (i = 0; i < arr.length; i++) {
    acc = i != arr.length - 1 ? acc + '/' + arr[i] : null;
    rtn[i + 1] = { name: arr[i].toUpperCase(), url: acc };
  }; return rtn;
};

function renderView(res, req, template, data = {}) {
  logger.debug(`Preparing template ${template}`);
  const client = res.locals.client, config = res.locals.config;
  const baseData = {
    bot: client,
    config: config,
    path: req.path,
    user: req.isAuthenticated() ? req.user : null,
    isAdmin: req.session.isAdmin,
    breadcrumbs: req.breadcrumbs,
  };
  if (config.debug) {
    logger.debug('Dumping data from render parameters');
    logger.data(`baseData=${JSON.stringify(baseData)}`);
    logger.data(`data=${JSON.stringify(data)}`);
  }
  logger.debug(`Rendering template ${template} with 'baseData' and 'data' parameters.`);
  res.render(path.resolve(`${viewsDir}${path.sep}${template}`), Object.assign(baseData, data));
};



module.exports = { checkAuth, isManaged, fetchBreadcrumbs, renderView };