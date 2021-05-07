// Native Node Imports
const url = require("url");
const path = require("path");

// For Discord Permission Handling
const Discord = require("discord.js");

// Express Session
const express = require("express");
const app = express();
const moment = require("moment");
require("moment-duration-format");
// Express Plugins
const passport = require("passport"); // oauth2 helper plugin
const helmet = require('helmet'); // security plugin
const session = require("express-session"); // session manager for express
const SQLiteStore = require("connect-sqlite3")(session);
const Strategy = require("passport-discord").Strategy;

module.exports = (client, config) => {
  // Dashboard root directory from bot working directory.
  const dashDir = path.resolve(`${process.cwd()}/cora/dashboard`);
  // Public and Views resource paths within Dashboard directory.
  const viewsDir = path.resolve(`${dashDir}/views/`)
  const publicDir = path.resolve(`${dashDir}/public/`)
  app.use("/public", express.static(publicDir));
  // Passport user handlers. Internal things for passport module.
  // Do not touch these, just leave them be.
  passport.serializeUser((user, done) => {
    done(null, user);
  });
  passport.deserializeUser((obj, done) => {
    done(null, obj);
  });
  // Defines Passport oauth2 data needed for dashboard authorization.
  // Requires clientID, clientSecret and callbackURL.
  // - clientID is the bot's unique client identification string.
  // - clientSecret is a secret code for oauth2 handling.
  // - callbackURL is the url to handle discord api callbacks.
  passport.use(new Strategy({
    clientID: config.dashboard.clientID,
    clientSecret: config.dashboard.oauthSecret,
    callbackURL: config.dashboard.callbackURL,
    scope: ["identify", "guilds"]
  },
  (accessToken, refreshToken, profile, done) => {
    process.nextTick(() => done(null, profile));
  }));
  // Session Data
  // This is used for temporary storage of your visitor's session information. It contains secrets that should not be shared publicly.
  app.use(session({
    store: new SQLiteStore({
      db: "sessions.db",
      dir: "./cora/cache/"
    }),
    secret: process.env.SESSION_SECRET || config.dashboard.sessionSecret,
    resave: false,
    saveUninitialized: false,
  }));

  // Initializes passport and session.
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(helmet());

  // The EJS templating engine gives us more power to create complex web pages. 
  // This lets us have a separate header, footer, and "blocks" we can use in our pages.
  app.engine("html", require("ejs").renderFile);
  app.set("view engine", "html");

  // body-parser reads incoming JSON or FORM data and simplifies their
  // use in code.
  var bodyParser = require("body-parser");
  app.use(bodyParser.json());       // to support JSON-encoded bodies
  app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
  })); 

  /* 
  Authentication Checks. For each page where the user should be logged in, double-checks
  whether the login is valid and the session is still active.
  */
  function checkAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    req.session.backURL = req.url;
    res.redirect("/login");
  }

  // This function simplifies the rendering of the page, since every page must be rendered
  // with the passing of these 4 variables, and from a base path. 
  // Objectassign(object, newobject) simply merges 2 objects together, in case you didn't know!
  const renderView = (res, req, template, data = {}) => {
    const baseData = {
      bot: client,
      config: config,
      path: req.path,
      user: req.isAuthenticated() ? req.user : null
    };
    res.render(path.resolve(`${viewsDir}${path.sep}${template}`), Object.assign(baseData, data));
  };


  // Regular Information Pages (public pages)
  app.get("/", (req, res) => {
    renderTemplate(res, req, "index.pug");
  });
};