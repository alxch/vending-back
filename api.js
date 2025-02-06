const express = require('express');
const router = express.Router();
const cors = require('cors');
const log = console.log;
router.use(cors());
// router.use(async (req, res, next) => {
//   next();
// });

const Config = {
  "stm": {
    "name": "Stm",
    "baudRate": 115200,
    "path": "/dev/ttyUSB0",
    "autoStart": true 
  },
  "bill": {
    "name": "Bill",
    "baudRate": 9600,
    "path": "/dev/ttyUSB1",
    "autoStart": true 
  }
};
const Stm = require('./stm');
const Bill = require('./bill');

// TODO: 
// start devices
const stm = new Stm(Config.stm);
// const bill = new Bill(Config.bill);

// const PaymentMethods = ['cash','payme'];
let item = {key:'',price:'',name:'',src:''};
let itemDelivered = false; // Boolean | Error
let payment = {
  method: '',
  cash:{amount:0,done:false},
  payme:{link:'https://payme.uz/?',done:false},
};
let cashTimer = null; 
let paymeTimer = null; 
let deliveryTimer = null;

const deliver = () => {
  if(!payment.payme.done && !payment.cash.done) return;
  deliveryTimer = setTimeout(()=>{
    reset();
    itemDelivered = true; // new Error('Cannot deliver'); 
    log(`ItemDelivered:`, itemDelivered, '\n');
    deliveryTimer = null;
  }, 3000);
};

const reset = () => {
  item = {key:'',price:'',name:'',src:''};
  payment = {
    method: '',
    cash:{amount:0,done:false},
    payme:{link:'https://payme.uz/?',done:false},
  };
  log(`Item:`, item, `Payment:`, payment);
};

// select item
router.post('/select-item', async (req, res) => {
  if(!(itemDelivered instanceof Error)){
    item = req.body;
    itemDelivered = false;
    log(`Item:`, item, 'ItemDelivered:', itemDelivered);
  }
  res.send(JSON.stringify({
    item,
    status: 'done'
  }));
});

// reset
router.post('/reset', async (req, res) => {
  reset();
  itemDelivered = false;
  log('ItemDelivered:', itemDelivered);
  res.send(JSON.stringify({
    status: 'done'
  }));
});

// select-payment-method
router.post('/select-payment-method', async (req, res) => {
  // TODO: make errors native HTTP-errors
  if(itemDelivered instanceof Error){
    res.status(500).send(itemDelivered.message);
    return;
  }
  if(payment.method == req.body.paymentMethod) {
    res.status(500).send(`Payment method "${payment.method}" already has been set`);
    return;
  }
  payment.method = req.body.paymentMethod;
  log(`Payment method:`, payment.method);

  await new Promise(resolve=>setTimeout(resolve,500));
  switch(payment.method){
    case 'cash':
      // TODO: 
      // start bill acceptor, clear links, cancel receipt (to be sure not to pay twice), start checking amount
      // if payment confirmed - set status 'done', stop bill (clear amount) /cancel receipt, and start delivering item
      if(paymeTimer) {
        payment.payme.link = 'https://payme.uz/?';
        clearInterval(paymeTimer);
        paymeTimer = null;
      }
      if(payment.cash.amount >= item.price){
        payment.cash.done = true;
        log(`Cash:`, payment.cash);
        break;
      }
      cashTimer = setInterval(()=>{
        payment.cash.amount+= 1000;
        if(payment.cash.amount >= item.price){
          clearInterval(cashTimer);
          cashTimer = null;
          payment.cash.done = true;
        }
        log(`Cash:`, payment.cash);
      }, 2000);
    break;
    
    case 'payme': 
      // TODO:
      // stop bill acceptor (don't clear amount), generate link, start checking status
      // if payment confirmed - set status 'done', stop bill (clear amount) /cancel receipt, and start delivering item
      if(cashTimer) {
        payment.cash.amount = payment.cash.amount; 
        clearInterval(cashTimer);
        cashTimer = null;
      }
      const link = payment.payme.link; 
      if(link.length - link.indexOf('?') >= 4){
        payment.payme.done = true;
        log(`Payme:`, payment.payme);
        break;
      }
      paymeTimer = setInterval(()=>{
        payment.payme.link+= '0';
        const link = payment.payme.link; 
        if(link.length - link.indexOf('?') >= 4){
          clearInterval(paymeTimer);
          paymeTimer = null;
          payment.payme.done = true;
        }
        log(`Payme:`, payment.payme);
      }, 2000);
    break;

    default: // back
      if(paymeTimer) {
        clearInterval(paymeTimer);
        paymeTimer = null;
      }
      if(cashTimer) {
        clearInterval(cashTimer);
        cashTimer = null;
      }
      payment.payme.link = 'https://payme.uz/?';
      payment.cash.done = false;
      payment.payme.done = false;
      log(`Payment:`, payment);
  }

  res.send(JSON.stringify({
    payment,
    status: 'done'
  }));
});

// payment-details
router.get('/payment-details', async (req, res) => {
  res.send(JSON.stringify({
    payment,
    status: (payment.payme.done || payment.cash.done) ? 'done' : 'processing'
  }));
});

// item-delivery
router.get('/item-delivery', async (req, res) => {
  if(!deliveryTimer) deliver();
  res.send(JSON.stringify(itemDelivered instanceof Error ? 
    {error: itemDelivered.message, status: 'error'} :
    {itemDelivered, status: itemDelivered ? 'done' : 'processing'}
  ));
});

module.exports = router;
