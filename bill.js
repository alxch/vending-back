const { BillValidator } = require('cashcode-bv');
const log = console.log;

const config = {
  "name": "Bill",
  "path": require('./config.json').bill.path,
};
const DEBUG = false;

class Bill extends BillValidator {
  constructor(){
    super(config.path, false /* debug */);
    this.name = config.name;

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
      await new Promise(resolve=>setTimeout(resolve,1000));
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

    // real bills
    this.on('escrow', async (bill) => {
      console.log(`${this.name}:ACCEPTed ${bill.amount}`);
      if(!onAccept) return;
      const result = await onAccept(bill.amount);
      if(result == '<') {
        await this.stack();
        return;
      }
      if(result == '=') {
        await this.stack();
        setTimeout(async()=>await this.deactivate(), 2500);
        return;
      }
      if(result == '>'){
        await this.retrieve();
        return;
      }
    });
  }

  async deactivate(){
    if(!this.isActive()) throw new Error(`${this.name}:DEACTIVATEd already`);

    this.active = false;
    if(DEBUG){
      await new Promise(resolve=>setTimeout(resolve,2000));
    } else {
      await this.end();
      this.removeAllListeners('escrow');
    }
    console.log(`${this.name}:DEACTIVATEd`);
  }
}

module.exports = Bill;
