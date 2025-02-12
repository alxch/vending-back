const { DelimiterParser } = require('@serialport/parser-delimiter');
const Serial = require('./serial');
const Action = require('./action');

const config = {
  "name": "Bill",
  "baudRate": 9600,
  "path": "/dev/ttyUSB0",
  "autoStart": true
};
const DEBUG = true;

class Bill extends Serial {
  constructor(){
    super({...config, parser: new DelimiterParser({ delimiter: '\r\n' })});
  }

  action = null;
  isActive = () => this.action && this.action.isActive();

  async activate({onAccept}){
    if(this.isActive()) throw new Error(`${this.name}:ACTIVATEd already`);

    if(DEBUG){
      await new Promise(resolve=>setTimeout(resolve,2000));
    } else {
      await this.enableRead(); // flush
      await this.write(Buffer.from('34001f0000','hex'));
      // TODO: read response
      // const data = (await this.read()).toString();
      // if(data != 'FF ') {
      //   throw new Error(`${this.name}:ACTIVATE expected 'FF ', recived ${data}`);
      // }
    }
    console.log(`${this.name}:ACTIVATEd`);

    // constructor
    this.action = new Action(async()=>{
      try{
        // don't wait, so can be deactivated w/o read wait
        const data = DEBUG ? await new Promise(resolve=>{
          setTimeout(()=>{
            resolve(Buffer.from('DEBUG'));
          }, 2000);
        }) : await this.read(0);
        if(!this.isActive()) return true;
        
        // TODO: get denomination of the banknote
        console.log(`${this.name}:ACCEPTed ${data.toString()}`);
        if(onAccept && await onAccept(DEBUG ? 1000 : 0/*TODO*/)){
          await this.deactivate();
          return true;
        };
      }
      catch(error){
        console.log(`${this.name}:ACCEPT`, error);
      }
    }, 20);
  }

  async deactivate(){
    if(!this.isActive()) throw new Error(`${this.name}:DEACTIVATEd already`);

    this.action.stop();
    if(DEBUG){
      await new Promise(resolve=>setTimeout(resolve,2000));
    } else {
      await this.write(Buffer.from('3400000000','hex'));
      // TODO: read response
      await this.disableRead();
    }
    console.log(`${this.name}:DEACTIVATEd`);
  }
}

module.exports = Bill;
