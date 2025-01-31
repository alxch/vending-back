var express = require('express');
var router = express.Router();
var cors = require('cors');
// const stm = require('./stm');
router.use(cors());
router.use(function (req, res, next) {
  console.log('Req: body=',req.body, 'params=',req.params, 'query=', req.query);
  next();
});

const delay = (seconds=1) => new Promise(resolve=>setTimeout(resolve,1000*seconds));
let item = {key:'',price:'',name:'',src:''};
let paymentMethod = '';
const paymentDetails = {
  cash:{amount:0,status:false},
  payme:{link:'',status:false},
};

router.post('/select-item', async (req, res) => {
  item = req.body;
  await delay();
  res.send(JSON.stringify({
    item,
    status: 'done'
  }));
});

router.post('/select-payment-method', async (req, res) => {
  paymentMethod = req.body.paymentMethod;
  await delay();
  res.send(JSON.stringify({
    paymentMethod,
    status: 'done'
  }));
});

router.get('/payment-details', async (req, res) => {
  await delay();
  res.send(JSON.stringify({
    paymentDetails,
    status: 'processing'
  }));
});

module.exports = router;
