// const { DelimiterParser } = require('@serialport/parser-delimiter');
// const Serial = require('./serial');
const { BillValidator } = require('cashcode-bv');
const log = console.log;

const config = {
  "name": "Bill",
  "path": "/dev/ttyUSB0",
};
const DEBUG = true;

class Bill extends BillValidator /* Serial */ {
  constructor(){
    // super({...config, parser: new DelimiterParser({ delimiter: '\r\n' }));
    super(config.path, true);
    this.name = config.name;
    if(DEBUG) return;

    this.connect().then(async()=>{
      log(`${this.name} info:`, this.info);
      log(`${this.name} billTable:`, this.billTable);
    },log);
  }

  active = false;
  isActive = () => this.active;

  async activate({onAccept}){
    if(this.isActive()) throw new Error(`${this.name}:ACTIVATEd already`);

    if(DEBUG){
      await new Promise(resolve=>setTimeout(resolve,2000));
    } else {
      await this.begin();
    }
    this.active = true;
    console.log(`${this.name}:ACTIVATEd`);

    if(DEBUG){
      const pay = ()=>{
        setTimeout(async ()=>{
          if(!this.isActive()) return;
          const bill = 1000;
          console.log(`${this.name}:ACCEPTed ${bill}`);
          if(onAccept && (await onAccept(bill) == '=')){
            await this.deactivate();
          } else {
            pay();
          };
        }, 2000);
      };
      pay();
      return;
    }

    
  }

  async deactivate(){
    if(!this.isActive()) throw new Error(`${this.name}:DEACTIVATEd already`);

    if(DEBUG){
      await new Promise(resolve=>setTimeout(resolve,2000));
    } else {
      await this.end();
    }
    this.active = false;
    console.log(`${this.name}:DEACTIVATEd`);
  }
}

module.exports = Bill;
