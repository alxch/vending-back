const { SerialPort } = require('serialport');

class Serial{
  /** @type {SerialPort} */
  port = null;
  /** @type {String} */
  name = null;
  /** @type {String} */
  path = null;
  /** @type {Number} */
  baudRate = null;
  /** @type {Buffer} */
  data = Buffer.alloc(0);
  readResolve = null;
  readReject = null;
  wasRead = false;
  readLength = 0; // set outside after actual data use

  constructor({ name, path, baudRate }){
    this.name = name;
    this.path = path;
    this.baudRate = baudRate;
    // auto-start
    this.start({path, baudRate}).then(console.log,console.log);
  }

  async start({ path, baudRate }){
    return await new Promise((resolve,reject) => {
      this.port = new SerialPort({ path, baudRate, autoOpen: false });
      
      this.port.once('open', () => { 
        console.log(`${this.name} opened`); 
        resolve();
      });

      this.port.on('data', data => {
        console.log(`${this.name} data:`, data);
        if(this.wasRead){
          // init
          this.data = Buffer.concat([this.data.subarray(this.readLength, this.data.length), data]);
          this.wasRead = false;
        } else {
          // concat
          this.data = Buffer.concat([this.data, data]);
        }
        
        // resolve if needed
        if(this.readPromise){
          this.readPromise.resolve(Buffer.from(this.data));
          this.wasRead = true;
          this.readPromise = null;
        }
      });

      this.port.on('error', error => { 
        console.log(`${this.name} error:`, error.message); 
        if(this.readReject){
          this.readReject(error);
          this.readReject = null;
        }
        reject(error); // once
      });
      
      this.port.open();
    });
  }

  async write(data){
    if(!this.port || !this.port.isOpen) throw new Error(`${this.name} port is closed`); 
    return await new Promise((resolve,reject) => {
      this.port.write(data, error => error ? reject(error) : resolve());
    })
  }

  /**
   * @returns {Promise<Buffer>}
   */
  async read(){
    if(this.data.length > 0 && !this.wasRead){
      this.wasRead = true;
      return Promise.resolve(Buffer.from(this.data));
    } else {
      return new Promise((resolve, reject)=>{
        this.readResolve = resolve;
        this.readReject = reject;
      })
    }
  }
}

module.exports = Serial;
