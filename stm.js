const Serial = require('./serial');

class Stm extends Serial {
  async sel({row=1, col=1, count=1}={}){
    console.log(`${this.name}:SEL row:${row},col:${col},count:${count}`);
    const cmd = 0x01;
    const res = [];
    
    for(let item = 0; item < count; item++){
      await this.write(Buffer.from([cmd,row,col]));
      
      /** @type {Buffer} */
      const data = await new Promise((resolve,reject)=>{
        const stop = this.readAsync(data=>{
          if(data[0] != cmd) {
            stop(); 
            reject(new Error(`${this.name}:SEL must be ${cmd}, received ${data[0]}`));
            return;
          };
          if(data[1] != 0x00) {
            stop();
            reject(new Error(`${this.name}:SEL returned withe error ${data[1]}`));
            return;
          }
          stop();
          resolve(data);
        }, reject); // on read error
      });

      res.push(data);
      console.log(`${this.name}:SEL ${item+1} of ${count} selected`);
    }
    
    return res;
  }
};

module.exports = Stm;
