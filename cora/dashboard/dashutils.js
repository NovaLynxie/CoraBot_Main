// Dashboard Utilities - Common Functions and Checks.

/* 
Authentication Checks. For each page where the user should be logged in, double-checks whether the login is valid and the session is still active.
*/
function checkAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  req.session.backURL = req.url;
  res.redirect("/login");
}

/* 
This function simplifies the rendering of the page, since every page must be rendered with the passing of these 4 variables, and from a base path. Objectassign(object, newobject) simply merges 2 objects together, in case you didn't know!
*/
const renderView = (res, req, template, data = {}) => {
  const baseData = {
    bot: client,
    config: config,
    path: req.path,
    user: req.isAuthenticated() ? req.user : null
  };
  res.render(path.resolve(`${viewsDir}${path.sep}${template}`), Object.assign(baseData, data));
};

console.log(checkAuth);
console.log(renderView);

module.exports = {checkAuth, renderView};