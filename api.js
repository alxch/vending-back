var express = require('express');
var router = express.Router();
var cors = require('cors');
// const stm = require('./stm');
// const bill = require('./bill');

router.use(cors());
router.use(async (req, res, next) => {
  console.log('Req: body=',req.body, 'params=',req.params, 'query=', req.query);
  await new Promise(resolve=>setTimeout(resolve,1000));
  next();
});

let item = {key:'',price:'',name:'',src:''};
let itemDelivered = false; // Boolean|Error 
let paymentMethod = '';
const paymentDetails = {
  cash:{amount:0,status:false},
  payme:{link:'',status:false},
};

router.post('/select-item', async (req, res) => {
  item = req.body;
  itemDelivered = false;
  // no checks for item
  res.send(JSON.stringify({
    item,
    status: 'done'
  }));
});

router.post('/select-payment-method', async (req, res) => {
  // TODO: make errors native HTTP-errors
  if(paymentMethod == req.body.paymentMethod) {
    res.status(500).send(`Payment method "${paymentMethod}" already has been set`);
    return;
  }

  paymentMethod = req.body.paymentMethod;
  // no checks for payment method

  // await for actions before respond, to allow FE block view
  // if cash - start bill acceptor, clear links, cancel receipt (to be sure not to pay twice), start checking amount
  // if qr - stop bill acceptor (don't clear amount), generate link, start checking status
  // if payment confirmed - set status 'done', stop bill (clear amount) /cancel receipt, and start delivering item
  // const [row,col] = item.key.split('.');
  // await stm.sel({row,col});
  res.send(JSON.stringify({
    paymentMethod,
    status: 'done'
  }));
});

router.get('/payment-details', async (req, res) => {
  res.send(JSON.stringify({
    paymentDetails,
    status: 'processing'
  }));
});

router.get('/item-delivery', async (req, res) => {
  res.send(JSON.stringify({
    status: itemDelivered instanceof Error ? 'error' : (itemDelivered ? 'done' : 'processing')
  }));
});

module.exports = router;
