const {LocalStorage} = require('node-localstorage');
const localStorage = new LocalStorage(__dirname+'/data');
const log = console.log;

/**
 * @type {{login:string,pass:string,token:string}}
 */
let user = JSON.parse(localStorage.getItem('user.json'));
if(!user){
  // default
  user = {
    login: 'admin',
    pass: 'SWG*setup',
    token: ''
  };
  localStorage.setItem('user.json', JSON.stringify(user));
}
log('User:', user);

module.exports = user;
