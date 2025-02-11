const express = require('express');
const router = express.Router();
const cors = require('cors');
const log = console.log;
router.use(cors());
// router.use(async (req, res, next) => {
//   next();
// });

// start devices
const Stm = require('./stm');
const stm = new Stm();
const Bill = require('./bill');
const bill = new Bill();

// const PaymentMethods = ['cash','payme'];
let item = {key:'',price:'',name:'',src:''};
let itemDelivered = false; // Boolean | Error
let payment = {
  method: '',
  cash:{amount:0,done:false},
  payme:{link:'',done:false},
};
let paymeTimer = null;

// let deliveryTimer = null;
// const deliver = () => {
//   if(!payment.payme.done && !payment.cash.done) return;
//   deliveryTimer = setTimeout(()=>{
//     reset(); // comment if error
//     itemDelivered = true; // new Error('Cannot deliver'); 
//     log(`ItemDelivered:`, itemDelivered, '\n');
//     deliveryTimer = null;
//   }, 3000);
// };

const reset = () => {
  item = {key:'',price:'',name:'',src:''};
  payment = {
    method: '',
    cash:{amount:0,done:false,error:null},
    payme:{link:'',done:false,error:null},
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

  // await new Promise(resolve=>setTimeout(resolve,500));
  try{
    switch(payment.method){
      case 'cash':
        // TODO: 
        // start bill acceptor, clear links, cancel receipt (to be sure not to pay twice), start checking amount
        // if payment confirmed - set status 'done', stop bill (clear amount) /cancel receipt, and start delivering item
        if(paymeTimer) {
          payment.payme.link = '';
          clearInterval(paymeTimer);
          paymeTimer = null;
        }

        const checkBill = async () => {
          if(payment.cash.amount >= item.price){
            payment.cash.done = true;
            log(`Cash:`, payment.cash);
            
            if(bill.isActive()){
              await bill.deactivate();
            }
            return true;
          }
        }
        if(await checkBill()) break;

        if(bill.isActive()) break;
        await bill.activate({accept:(amount)=>{
          payment.cash.amount+= amount;
          checkBill();
        }});
      break;
      
      case 'payme': 
        // TODO:
        // stop bill acceptor (don't clear amount), generate link, start checking status
        // if payment confirmed - set status 'done', stop bill (clear amount) /cancel receipt, and start delivering item
        
        if(bill.isActive()) await bill.deactivate();

        const checkLink = () => {
          const link = payment.payme.link; 
          if(link.length >= 3){
            payment.payme.done = true;
            log(`Payme:`, payment.payme);
            return true;
          } else {
            payment.payme.link+= '0';
            log(`Payme:`, payment.payme);
          }
        };
        if(checkLink()) break;

        paymeTimer = setInterval(()=>{
          if(checkLink()){
            clearInterval(paymeTimer);
            paymeTimer = null;
          }
        }, 2000);
      break;

      default: // back
        if(paymeTimer) {
          clearInterval(paymeTimer);
          paymeTimer = null;
        }
        
        if(bill.isActive()) await bill.deactivate();
        
        payment.payme.link = '';
        payment.cash.done = false;
        payment.payme.done = false;
        payment.cash.error = payment.payme.error = null;
        log(`Payment:`, payment);
    }
    if(payment.method){
      payment[payment.method].error = null;
    }
    
    res.send(JSON.stringify({
      payment,
      status: 'done'
    }));
  }
  catch(error){
    console.error('Select payment method error:', error);
    if(payment.method){
      payment[payment.method].error = error.message;
    }
    
    res.send(JSON.stringify({
      error: error.message,
      status: 'error'
    }));
  }
});

// payment-details
router.get('/payment-details', async (req, res) => {
  res.send(JSON.stringify({
    payment,
    status: (payment.payme.done || payment.cash.done) ? 'done' : 'processing'
  }));
});

// deliver-item
router.post('/deliver-item', async (req, res) => {
  try{
    const [row,col] = item.key.split('.');
    await stm.sel({row,col});
    itemDelivered = true;
    reset();
    res.send(JSON.stringify({itemDelivered, status: 'done'}));
  }
  catch(error){
    console.error('Deliver item:', error);
    itemDelivered = error;
    res.send(JSON.stringify({error: itemDelivered.message, status: 'error'}));
  }
});

module.exports = router;
