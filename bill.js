const { DelimiterParser } = require('@serialport/parser-delimiter');
const Serial = require('./serial');
const config = {
  "name": "Bill",
  "baudRate": 9600,
  "path": "/dev/ttyUSB1",
  "autoStart": true
};

class Bill extends Serial {
  constructor(){
    super({...config, parser: new DelimiterParser({ delimiter: '\r\n' }),
      readEnable: false
    });
  }
  
  acceptReject = null;
  async activate({accept}){
    if(this.acceptReject) return;

    console.log(`${this.name}:ACTIVATE`);
    await this.write(Buffer.from('34001f0000','hex'));
    this.packets = [];
    this.readEnable = true;

    // may be separate function
    setTimeout(async()=>{
      while(true){
        try{
          const data = await Promise.race([
            this.read(), new Promise((resolve,reject)=>{
              this.acceptReject = reject;
            })
          ]);
          // TODO: get denomination of the banknote
          console.log(`${this.name}:ACCEPT ${data.toString()}`);
          accept && accept(1000);
          // this.emit('accept', 1000);
        }
        catch(error){
          console.log(`${this.name}:`, error);
          if(error === 'DEACTIVATE') return;
        }
      }
    },1);
  }

  async deactivate(){
    if(!this.acceptReject) return;

    console.log(`${this.name}:DEACTIVATE`);
    if(this.acceptReject) {
      this.acceptReject('DEACTIVATE');
      this.acceptReject = null;
    }
    await this.write(Buffer.from('3400000000','hex'));
    this.readEnable = false;
  }
}

module.exports = Bill;
