const { ByteLengthParser } = require('serialport');
const Serial = require('./serial');
const log = console.log;
const config = {
  "name": "Stm",
  "baudRate": 115200,
  "path": "/dev/ttyUSB0",
  "autoStart": true 
};

class Stm extends Serial {
  constructor(){
    super({...config, parser: new ByteLengthParser({ length: 2 })});
  }
  async sel({row=1, col=1, count=1}){
    log(`${this.name}:SEL row:${row},col:${col},count:${count}`);
    const cmd = 0x01;
    const res = [];

    for(let item = 0; item < count; item++){
      await this.write(Buffer.from([cmd,row,col]));
      
      /** @type {Buffer} */
      let data = await this.read();

      if(data[0] != cmd) {
        throw new Error(`${this.name}:SEL must be ${cmd}, received ${data[0]}`);
      };
      if(data[1] != 0x01) {
        throw new Error(`${this.name}:SEL returned withe error ${data[1]}`);
      }

      res.push(data);
      log(`${this.name}:SEL ${item+1} of ${count} selected`);
    }
    
    return res;
  }
};

module.exports = Stm;
