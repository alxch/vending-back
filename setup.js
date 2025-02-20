const crypto = require('crypto');
const express = require('express');
const router = express.Router();
const cors = require('cors');
const log = console.log;
const logError = (...args) => {
  console.error(`\x1b[31m${args[0]}\x1b[0m`, ...args.slice(1));
}
router.use(cors());

const user = require('./user').user;
let loginInProgress = '';
log(`LoginInProgress: "${loginInProgress}"`);

// TODO: handle unhandled errors
router.post('/logout', async (req, res) => {
  const {login} = req.body;

  if(user.login == login && user.token){
    user.token = '';
    res.send(JSON.stringify({
      token: user.token,
      status: 'done' 
    }));
    log('Logout:', user);
  } else {
    res.send(JSON.stringify({
      error:`User "${login}" is invalid or user has been already logged out`,
      status: 'error'
    }));
    logError('Logout:', req.body);
  }
});

router.post('/login', async (req, res) => {
  const {login,token} = req.body;
  
  await new Promise(resolve=>setTimeout(resolve, 1000));
  if(user.login == login && user.token == token && user.token){
    res.send(JSON.stringify({
      login: user.login,
      token: user.token,
      status: 'done'
    }));
    log('Login:', user);
  } else {
    user.token = '';
    log('Login:', user);
    res.send(JSON.stringify({
      error:`User ${login && `"${login}"`} not authorized`,
      status: 'error'
    }));
    logError('Login:', req.body);      
  }
});

router.post('/auth', async (req, res) => {
  const {login,pass} = req.body;

  if(user.token){
    res.send(JSON.stringify({
      error:`User "${login}" already authorized`,
      status: 'error'
    }));
    logError('Auth login:', login);
    return;   
  }
  if(loginInProgress){
    res.send(JSON.stringify({
      error:`User "${loginInProgress}" is in authorization progress`, 
      status: 'error'
    }));
    logError('Auth loginInProgress:', loginInProgress);
    return;
  }

  loginInProgress = login;
  try{
    // delay
    await new Promise(resolve=>setTimeout(resolve, 1000));
  
    // check
    const valid = (login == user.login && pass == user.pass);
    if(valid){
      user.token = crypto.randomBytes(32).toString('hex');
      res.send(JSON.stringify({
        login:user.login,
        token:user.token, 
        status: 'done' 
      }));
      log('Auth:', user);
    } else {
      res.send(JSON.stringify({
        error:`User credentials are invalid`, 
        status: 'error'
      }));
      logError('Auth:', req.body);
    }
  }
  catch(error){
    logError('Auth error:', error);
  }
  loginInProgress = null;
});

module.exports = router;
