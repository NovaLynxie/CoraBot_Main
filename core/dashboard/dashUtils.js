const renderView = (res, req, template, data = {}) => {
  logger.debug(`Preparing template ${template}`);
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

module.exports = { renderView };