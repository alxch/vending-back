const { SerialPort } = require('serialport');
const { Transform } = require('stream');
const log = console.log;

class Serial{
  /** @type {SerialPort} */
  port = null;
  /** @type {String} */
  name = null;
  /** @type {String} */
  path = null;
  /** @type {Number} */
  baudRate = null;
  /** @type {Buffer[]} */
  packets = [];
  /** @type {Transform} */
  parser = null;

  readPromise = {resolve:null, reject: null};

  constructor({ name, path, baudRate, parser, autoStart }){
    this.name = name || path;
    this.parser = parser || null;
    if(!path ||  !baudRate) throw new Error(`Path and Baudrate for "${name}" should be specified`);
    this.path = path;
    this.baudRate = baudRate;
    if(autoStart){
      this.start().then(log,log);
    }
  }

  async start(){
    if(this.port) throw new Error(`${this.name} port already opened`);
    
    return await new Promise((resolve,reject) => {
      this.port = new SerialPort({ path:this.path, baudRate:this.baudRate, autoOpen: false });
      
      this.port.once('open', () => { 
        log(`${this.name} opened.`); 
        resolve();
      });

      const onRead = data => {
        log(`${this.name} read data:`, data);
        this.packets.push(data);
        if(this.readPromise.resolve){
          this.readPromise.resolve(this.packets.shift());
          this.readPromise.resolve = null;
        }
      };
      if(this.parser)
        this.port.pipe(this.parser).on('data', onRead);
      else
        this.port.on('data', onRead);

      this.port.on('error', error => { 
        log(`${this.name} error:`, error.message); 
        if(this.readPromise.reject){
          this.readPromise.reject(error);
          this.readPromise.reject = null;
        }
        reject(error); // once
      });
      
      this.port.open();
    });
  }

  async write(data){
    if(!this.port || !this.port.isOpen) {
      throw new Error(`${this.name} port is closed`);
    }
    return await new Promise((resolve,reject) => {
      log(`${this.name} write data:`, data);
      const result = this.port.write(data, error => error ? reject(error) : resolve(result));
    })
  }

  /**
   * @returns {Promise<Buffer>}
   */
  async read(timeout = 5000){
    if(!this.port || !this.port.isOpen) {
      throw new Error(`${this.name} port is closed`);
    }

    if(this.packets.length > 0){
      return Promise.resolve(this.packets.shift());
    } else {
      return Promise.race([
        new Promise((resolve, reject)=>{
          this.readPromise = {resolve, reject};
        }),
        new Promise((resolve, reject)=>{
          setTimeout(()=>{
            this.readPromise = {resolve: null, reject: null};
            reject(new Error(`${this.name} read timeout`));
          }, timeout);
        })
      ])
    }
  }
}

module.exports = Serial;
