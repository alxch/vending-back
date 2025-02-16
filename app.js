var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var apiRouter = require('./api');

var app = express();

// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
const staticPath = path.join(__dirname, '');
app.use(express.static(staticPath));

app.use('/api', apiRouter);

module.exports = app;
