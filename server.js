const path = require('path');
const express = require('express');
const app = express();

require('dotenv').config()
const port = process.env.PORT || 3021;

app.use((req, res, next) => {
  let sslUrl;

  //By default, Heroku sets NODE_ENV to production
  if (process.env.NODE_ENV === 'production' &&
    req.headers['x-forwarded-proto'] !== 'https') {

    sslUrl = ['https://', req.hostname, req.url].join('');
    return res.redirect(301, sslUrl);
  }

  return next();
});

app.use(express.static(path.join(__dirname, 'build')));

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
  console.log(`SimpleFi client server listening on port ${port} 🎉`)
})

