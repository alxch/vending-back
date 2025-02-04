const Serial = require('./serial');

class Stm extends Serial {
  async sel({row=1, col=1, count=1}={}){
    console.log(`${this.name}:SEL row:${row},col:${col},count:${count}`);
    const cmd = 0x01;
    const res = [];

    for(let item = 0; item < count; item++){
      await this.write(Buffer.from([cmd,row,col]));
      
      /** @type {Buffer} */
      let data = Buffer.alloc(0);
      while(data.length < 2){
        data = Buffer.concat([data, await this.read()]);
      }
      // TODO: parse protocol
      // if(data.length > 2){
      //   throw new Error(`${this.name}:SEL too much (>2) data received ${data}`);
      // }
      this.readLength = 2;

      if(data[0] != cmd) {
        throw new Error(`${this.name}:SEL must be ${cmd}, received ${data[0]}`);
      };
      if(data[1] != 0x01) {
        throw new Error(`${this.name}:SEL returned withe error ${data[1]}`);
      }

      res.push(data);
      console.log(`${this.name}:SEL ${item+1} of ${count} selected`);
    }
    
    return res;
  }
};

module.exports = Stm;
