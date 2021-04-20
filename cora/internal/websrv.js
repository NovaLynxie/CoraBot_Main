const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Systems Online. Response 200 -> OK!');
});

const port = 3000;

app.listen(port, () => {
  console.log(`Server connected to port ${port}`);
});