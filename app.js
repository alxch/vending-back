var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var pjson = require('./package.json');

console.log(`
************************************
*                                  *   
* ${(pjson.name + " " + pjson.version).padEnd(32)} *
*                                  *
************************************
`);

var apiRouter = require('./api');
var setupRouter = require('./setup');
var itemsRouter = require('./items').router;

var app = express();

// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const staticDir = path.join(__dirname, '');
app.use('/', express.static(staticDir));
app.use('/setup', express.static(staticDir));
app.use('/api', apiRouter);
app.use('/api/setup', setupRouter);
app.use('/api/items', itemsRouter);

module.exports = app;
