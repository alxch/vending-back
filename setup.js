const crypto = require('crypto');
const express = require('express');
const router = express.Router();
const cors = require('cors');
const log = console.log;
const logError = (...args) => {
  console.error(`\x1b[31m${args[0]}\x1b[0m`, ...args.slice(1));
}
router.use(cors());

// TODO: handle unhandled errors
const user = {
  login: 'alex',
  pass: 'wilbur53'
};
let session = {token:'', auth:{login:'',pass:''}};
let loginInProgress = '';
log('Session:', session);
log('LoginInProgress:', loginInProgress);

router.post('/auth', async (req, res) => {
  const auth = req.body;
  const {login,pass} = auth;

  if(session?.auth?.login == login){
    res.send(JSON.stringify({
      error:`User "${login}" already authorized`,
      token: session.token,
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
    const valid = login == user.login && pass == user.pass;
    let token = '';
    if(valid){
      token = crypto.randomBytes(32).toString('hex');
      session = {token, auth};
      res.send(JSON.stringify({
        token, status: 'done' 
      }));
      log('Auth session:', session);
    } else {
      res.send(JSON.stringify({
        error:`User credentials are invalid`, 
        status: 'error'
      }));
      throw auth;
    }
  }
  catch(error){
    logError('Auth error:', error);
  }
  loginInProgress = null;
});

module.exports = router;
