const logger = require('../plugins/winstonplugin');
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Systems Online. Response 200 → OK!');
});

const port = 3000;

app.listen(port, () => {
  logger.info(`Server connected to port ${port}`);
});