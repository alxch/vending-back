const express = require('express');
const router = express.Router();
const cors = require('cors');
const log = console.log;
const logError = (...args) => {
  console.error(`\x1b[31m${args[0]}\x1b[0m`, ...args.slice(1));
}
router.use(cors());
const {LocalStorage} = require('node-localstorage');
const localStorage = new LocalStorage(__dirname+'/data');
const user = require('./user').user;

/** @type {{count:number,sold:number,key:string}[]} */
let items = JSON.parse(localStorage.getItem('items.json'));
if(!items){
  // default
  items = [
    {
      sold: 0,
      count: 1,
      key: '1.1',
      price: 1000,
      name: 'Coca-Cola\n100ml',
      src: './images/item-1.png'
    },
    {
      sold: 0,
      count: 2,
      key: '1.3',
      price: 2000,
      name: 'Coca-Cola\n200ml',
      src: './images/item-2.png'
    },
    {
      sold: 0,
      count: 3,
      key: '1.5',
      price: 3000,
      name: 'Coca-Cola\n300ml',
      src: './images/item-3.png'
    },
  ];
  localStorage.setItem('items.json', JSON.stringify(items));
}
items.save = () => {
  localStorage.setItem('items.json', JSON.stringify(items));
}
log('Items:',items);

router.get('/', async (req, res) => {
  // log('Items get');
  res.send(JSON.stringify({
    items,
    status: 'done' 
  }));
});

router.post('/', async (req, res) => {
  if(!user.token){
    res.send(JSON.stringify({
      error: 'Items post: unauthorized action',
      status: 'error'
    }));
    return;
  }

  items.length = 0;
  req.body.forEach(item=>items.push(item));
  items.save();
  res.send(JSON.stringify({
    items,
    status: 'done' 
  }));
  log('Items post:', items);
});

module.exports = {items, router};
