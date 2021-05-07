const logger = require('../providers/WinstonPlugin');
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Systems Online. Response 200 → OK!');
});

const port = 3000;
logger.init('Starting Simple Web Responder v1.0')
app.listen(port, () => {
  logger.info(`Server connected to port ${port}`);
});