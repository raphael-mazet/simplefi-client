import sslRedirect from 'heroku-ssl-redirect';
const path = require('path');
const express = require('express');
const sslRedirect = require('heroku-ssl-redirect').default
const app = express();

require('dotenv').config()
const port = process.env.PORT || 3021;

app.use(sslRedirect());
app.use(express.static(path.join(__dirname, 'build')));

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
  console.log(`SimpleFi client server listening on port ${port} 🎉`)
})