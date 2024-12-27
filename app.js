var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var apiRouter = require('./api');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'front')));

app.use('/api', apiRouter);

// get config
var config = require('./config.json');

// start STM driver
const stm = require('./stm');
stm.start(config.stm);

module.exports = app;
