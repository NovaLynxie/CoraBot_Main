const express = require('express');
const passport = require('passport');
const router = express.Router();
const logger = require('../../utils/winstonLogger');
const { renderView } = require('../dashUtils');

// Dashboard Actions - All Interaction & Authentication actions.
router.get('/login', (req, res, next) => {
  if (req.session.backURL) {
    next();
  }	else 
  if (req.headers.referer) {
    const parsed = url.parse(req.headers.referer);
    if (parsed.hostname === req.app.locals.domain) {
      req.session.backURL = parsed.path;
    }
  }	else {
    req.session.backURL = '/';
  }; next();
}, passport.authenticate('discord'));
// OAuth2 Callback Endpoint
router.get('/api/discord/callback', passport.authenticate('discord', { failureRedirect: '/autherror' }), (req, res) => {
  const client = res.locals.client;
  logger.debug(`Checking req.user.id ${req.user.id} against owner IDs`);
  logger.data(`client.options.owners => ${client.options.owners}`);
  logger.data(`data type: ${typeof client.options.owners}`);
  (client.options.owners.includes(req.user.id)) ? req.session.isAdmin = true : req.session.isAdmin = false;
  if (req.session.isAdmin) {
    logger.debug(`DiscordUser with ID:${req.user.id} logged in as 'ADMIN'.`);
  }	else {
    logger.debug(`DiscordUser with ID:${req.user.id} logged in as 'USER'.`);
  };
  req.flash('success', 'Authenticated/Action Successful!');
  if (req.session.backURL) {
    const url = req.session.backURL;
    req.session.backURL = null;
    res.redirect(url);
  }	else {
    res.redirect('/');
  };
});
// Error Message - Show this if auth fails or action is interrupted.
router.get('/autherror', (req, res) => {
  renderView(res, req, 'autherr.pug');
});
// Logout Endpoint - Destroys the session to log out the user.
router.get('/logout', function(req, res) {
  req.session.destroy(() => {
    req.logout();
    req.flash('info', 'You have now been logged out of the dashboard.');
    res.redirect('/');
  });
});

module.exports = router;