const express = require('express');
const router = express.Router();
const dashUtils = require('../dashutils.js');
const {checkAuth, renderView} = dashUtils;

router.get("/", function(req, res, next) {
  renderView("index.pug")
})

module.exports = router;