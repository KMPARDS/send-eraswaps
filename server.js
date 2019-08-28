const express = require('express');
const path = require('path');
const helmet = require('helmet');

//kES0hO1HLqc7uQUdhRaYKwKoUftPTdmP

var redis = require("redis");
    client = redis.createClient(6379);

// let cache = require('express-redis-cache')({
//   host: 'redis-12649.c17.us-east-1-4.ec2.cloud.redislabs.com',
//   port: 12649,
//   auth_pass: 'kES0hO1HLqc7uQUdhRaYKwKoUftPTdmP',
//   expire: 60
// });

client.on('connect', () => {
  console.log(`connected to redis`);
  // cache = require('express-redis-cache')({ expire: 60 });
});

const { getPlatformDetails } = require('./dashboard');

const app = express();

app.use(helmet());

app.use((req, res, next) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Strict-Transport-Security': 'max-age=31536000; preload'
  });
  return next();
});

app.use(function(req,res,next) {
  if(req.headers["x-forwarded-proto"] == "http") {
    res.redirect("https://www.timeally.io" + req.url);
  } else {
    return next();
  }
});

app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'build')));

app.get('/ping', function (req, res) {
 return res.send('pong');
});

// app.get("*", function(request, response){
//   response.redirect("https://" + request.headers.host + request.url);
// });

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on PORT ${port}`));
