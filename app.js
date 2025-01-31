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

// start devices
// var config = require('./config.json');
// const Stm = require('./stm');
// const stm = new Stm(config.stm);
// const Bill = require('./bill');
// const bill = new Bill(config.bill);

module.exports = app;
