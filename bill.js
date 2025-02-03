const Serial = require('./serial');

class Bill extends Serial {
  accepting = false;

  // TODO: use generator instead of events
  async accept(){
    this.accepting = true;
    let data = Buffer.alloc(0);
    while(this.accepting){
      data = Buffer.concat([data, await this.read()]);
      const idx = data.indexOf(Buffer.from('0d0a','hex'));
      if(idx != -1){
        this.readLength = idx + 2;
        data = data.subarray(0, idx);
        console.log(`${this.name}:ACCEPT ${data}:${data.toString()}`);
        
        // TODO: get denomination of the banknote
        // this.emit('accept', 1000);
      }
    }
  }
  async activate(){
    console.log(`${this.name}:ACTIVATE`);
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
