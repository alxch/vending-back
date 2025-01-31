const Serial = require('./serial');

class Stm extends Serial {
  async sel({row=1, col=1, count=1}={}){
    console.log(`${this.name}:SEL row:${row},col:${col},count:${count}`);
    const cmd = 0x01;
    const res = [];

    for(let item = 0; item < count; item++){
      await this.write(Buffer.from([cmd,row,col]));
      
      /** @type {Buffer} */
      res.push(await new Promise((resolve,reject)=>{
        let data = Buffer.alloc(0);
        const stop = this.readAsync({onData: chunk=>{
          data = Buffer.concat([data,chunk]);
          if(data.length < 3) return;
          // store extra data into this.data 

          if(data[0] != cmd) {
            stop();
            reject(new Error(`${this.name}:SEL must be ${cmd}, received ${data[0]}`));
            return;
          };
          if(data[1] != 0x01) {
            stop();
            reject(new Error(`${this.name}:SEL returned withe error ${data[1]}`));
            return;
          }
          stop();
          resolve(data);
        }, onError: reject}); // on read error
      }));
      console.log(`${this.name}:SEL ${item+1} of ${count} selected`);
    }
    
    return res;
  }
};

module.exports = Stm;
