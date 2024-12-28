var express = require('express');
var router = express.Router();
var cors = require('cors');
// const stm = require('./stm');

router.use(cors());

const max_attempts = 2;
let attempts = max_attempts;
const send = (data, res) => {
  if(attempts > 0){
    attempts--;
    data = {status:'processing'};
  }
  else {
    attempts = max_attempts;
  }
  res.send(JSON.stringify(data));
};

router.post('/cancel', async (req, res) => {
  attempts = max_attempts;
});

router.post('/select-item', async (req, res) => {
  send({
    status: 'done'
  },res);
});

router.get('/payment-links', async (req, res) => {
  send({
    status: 'done', 
    payme: 'https://payme.uz/home/main',
    click: 'https://click.uz/ru',
    uzum: 'https://uzumbank.uz/en'
  },res);
});

router.get('/payment-status', async (req, res) => {
  send({
    status: 'done',
    method: 'payme'
  },res);
});

module.exports = router;
