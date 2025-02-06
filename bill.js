const { DelimiterParser } = require('@serialport/parser-delimiter');
const Serial = require('./serial');
const config = {
  "name": "Bill",
  "baudRate": 9600,
  "path": "/dev/ttyUSB0",
  "autoStart": true
};

class Bill extends Serial {
  constructor(){
    super({...config, parser: new DelimiterParser({ delimiter: '\r\n' })});
  }
  
  accepting = false;
  // TODO: use generator (for data/error/ending) instead of events
  async accept(){
    while(this.accepting){
      try{
        const data = await this.read(30); // 30 sec.
        // TODO: get denomination of the banknote
        console.log(`${this.name}:ACCEPT ${data}`);
        this.emit('accept', 1000);
      }
      catch(error){
        console.error(error);
        // repeat accept
      }
    }
  }

  async activate(){
    console.log(`${this.name}:ACTIVATE`);
    this.accepting = true;
    await this.write(Buffer.from('34001f0000','hex'));
    this.accept();
  }

  async deactivate(){
    console.log(`${this.name}:DEACTIVATE`);
    this.accepting = false;
    await this.write(Buffer.from('3400000000','hex'));
  }
}

module.exports = Bill;
