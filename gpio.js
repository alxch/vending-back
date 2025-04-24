const Gpio = require('onoff').Gpio;
const log = console.log;

// /sys/kernel/debug/gpio
const 
  GPIO0 = 512, GPIO1 = 513, GPIO2 = 514, GPIO3 = 515, GPIO4 = 516, GPIO5 = 517, GPIO6 = 518, GPIO7 = 519, GPIO8 = 520, GPIO9 = 521, GPIO10 = 522, GPIO11 = 523, GPIO12 = 524, GPIO13 = 525, GPIO14 = 526, GPIO15 = 527, GPIO16 = 528, GPIO17 = 529, GPIO18 = 530, GPIO19 = 531, GPIO20 = 532, GPIO21 = 533, GPIO22 = 534, GPIO23 = 535, GPIO24 = 536, GPIO25 = 537, GPIO26 = 538, GPIO27 = 539
;  

const config = {
  cols: [GPIO0, GPIO1, GPIO2, GPIO3, GPIO4, GPIO5, GPIO6, GPIO7, GPIO8, GPIO9],
  rows: [GPIO10, GPIO11, GPIO12, GPIO13, GPIO14, GPIO15],
  trig: GPIO16
};  

const TIMEOUT = 7000;
const MIN_INT = 50;
const SHORT_INT = [900, 1800];
const LONG_INT = [3300, 6600];

module.exports = {
  ...{
    GPIO0, GPIO1, GPIO2, GPIO3, GPIO4, GPIO5, GPIO6, GPIO7, GPIO8, GPIO9,
    GPIO10, GPIO11, GPIO12, GPIO13, GPIO14, GPIO15, GPIO16, GPIO17, GPIO18, GPIO19,
    GPIO20, GPIO21, GPIO22, GPIO23, GPIO24, GPIO25, GPIO26, GPIO27
  },

  async sel({row=1, col=1, type='long'}){
    // gpio's
    const colGpio = new Gpio(col > 511 ? col : config.cols(col-1), 'low');
    const rowGpio = new Gpio(row > 511 ? row : config.rows(row-1), 'low');
    const trigGpio = new Gpio(config.trig, 'in', 'both');

    // promise
    let doneCb, errorCb;
    const promise = new Promise((resolve, reject)=>{
      doneCb = (type) =>{
        deinit();
        resolve(type);
      };
      errorCb = (error) => {
        deinit();  
        reject(error);
      }
    });

    // deinit
    const deinit = () => {
      if(timer) clearTimeout(timer);
      colGpio.writeSync(0);
      rowGpio.writeSync(0);
      trigGpio.unwatchALl();
    };

    // timeout
    const timer = setTimeout(()=>{
      timer = null;
      errorCb(`GPIO [${col}:${row}] timeout (${TIMEOUT})`);
    }, TIMEOUT);  

    // init
    let begin = Date.now(), acc = 0, first = true;

    // watch
    trigGpio.watch((error,value)=>{
      if(error){
        log(`GPIO error [${col}:${row}]/${value}b: `, error);
        errorCb(error);
        return;
      }

      // int
      const int = Date.now() - begin;
      if(first){
        log(`GPIO first [${col}:${row}]/${value}b: ${int}ms`);
        // UPD: timeout can be set to min first pulse and cleared if it present
        first = false;
      }
      if(int > MIN_INT){
        acc+= int;
        log(`GPIO acc [${col}:${row}]/${value}b: ${int}ms/${acc}ms`);
      } else {
        if(acc >= SHORT_INT[0] && acc <= SHORT_INT[1]){
          log(`GPIO short [${col}:${row}]: ${acc}ms`);
          if(type == 'short') doneCb(type);
        }
        else if(acc >= LONG_INT[0] && acc <= LONG_INT[1]){
          log(`GPIO long [${col}:${row}]: ${acc}ms`);
          if(type == 'long') doneCb(type);
        }
        acc = 0;
      }

      // repeat
      begin = Date.now();
    });

    // start
    colGpio.writeSync(1);
    rowGpio.writeSync(1);
    begin = Date.now();

    return promise;
  }
};
