var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var apiRouter = require('./api');
var setupRouter = require('./setup');

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

module.exports = app;
