const { ByteLengthParser } = require('serialport');
const Serial = require('./serial');
const log = console.log;
const config = {
  "name": "STM",
  "baudRate": 9600,
  "path": require('./config.json').stm.path,
  "autoStart": true 
};
const DEBUG = false;

class Stm extends Serial {
  constructor(){
    super({
      ...config, 
      parser: new ByteLengthParser({ length: 2 })
    });
  }

  /** @returns {Promise<Boolean[]>} */
  async sel({row=1, col=1, count=1}){
    log(`${this.name}:SEL row:${row},col:${col},count:${count}`);
    if(DEBUG) {
      return await new Promise(resolve=>{
        setTimeout(()=>{
          resolve(new Array(count).fill(true));
        }, 2000);
      })
    }
    await this.flush(); 

    const cmd = 0x01;
    /** @type {Buffer[]} */
    const res = [];
    for(let item = 0; item < count; item++){
      await this.write(Buffer.from([cmd,row,col]));
      
      /** @type {Buffer} */
      let data = await this.read(30);

      if(data[0] != cmd) {
        throw new Error(`${this.name}:SEL must be ${cmd}, received ${data[0]}`);
      };
      if(data[1] != 0x00) {
        throw new Error(`${this.name}:SEL returned with error ${data[1]}`);
      }

      res.push(true);
      log(`${this.name}:SEL ${item+1} of ${count} selected`);
    }

    // await this.disableRead();
    return res;
  }
};

module.exports = Stm;
