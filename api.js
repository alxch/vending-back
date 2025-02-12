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
const Payme = require('./payme');
const payme = new Payme();

// global vars
const PaymentMethods = ['cash','payme'];
let itemDelivered = false; // Boolean | Error
let item = null;
let payment = null;

// init vars.
const initVars = () => {
  item = {key:'',price:'',name:'',src:''};
  payment = {
    method: '',
    cash: {amount:0,done:false,error:null},
    payme:{link:'', done:false,error:null},
  };
  log(`Item:`, item);
  log(`Payment:`, payment);
};
initVars();
log(`ItemDelivered:`, itemDelivered);

// select item
router.post('/select-item', async (req, res) => {
  if(!(itemDelivered instanceof Error)){
    // if item not delivered
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
  initVars();
  itemDelivered = false; // accept failure
  log('ItemDelivered:', itemDelivered);
  res.send(JSON.stringify({
    status: 'done'
  }));
});

// select-payment-method
router.post('/select-payment-method', async (req, res) => {
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

  try{
    switch(payment.method){
      case 'cash':
        if(payme.isActive()){
          await payme.cancel();
        }

        const onAccept = async(amount=0)=>{
          payment.cash.amount+= amount;
          log(`Cash ammount:`, payment.cash.amount);

          if(payment.cash.amount < item.price) 
            return false;
          else {
            payment.cash.done = true;
            log(`Cash:`, payment.cash);
            return true;
          }
        };
        if(payment.cash.amount > 0 && await onAccept()) break;

        // start
        if(bill.isActive()) break;
        await bill.activate({onAccept});
      break;
      
      case 'payme': 
        if(bill.isActive()){
          await bill.deactivate();
        }

        // start
        if(payme.isActive()) break;
        await payme.create({item, onCheck:async(result)=>{
          if(result instanceof Object) {
            payment.payme.link = `[${result.attempt}] ${payment.payme.link}`;
            return;
          }
          
          if(!result) return;
          payment.payme.done = true;
          log(`Payme:`, payment.payme);
          return true;
        }});
        payment.payme.link = 'https://checkout.paycom.uz/'+payme._id;
        log(`Payme:`, payment.payme);
      break;

      default: // back
        if(bill.isActive()) await bill.deactivate();
        payment.cash.amount = payment.cash.amount;
        payment.cash.done = false;
  
        if(payme.isActive()) await payme.cancel();
        payment.payme.link = '';
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
    res.status(500).send(JSON.stringify({
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
    log(`ItemDelivered:`, itemDelivered);
    initVars();
    res.send(JSON.stringify({itemDelivered, status: 'done'}));
  }
  catch(error){
    console.error('Deliver item:', error);
    itemDelivered = error;
    log(`ItemDelivered:`, itemDelivered);
    res.status(500).send(JSON.stringify({error: itemDelivered.message, status: 'error'}));
  }
});

module.exports = router;
