const EventEmitter = require('events');
const { SerialPort } = require('serialport');
const { Transform } = require('stream');
const log = console.log;

class Serial extends EventEmitter{
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
  readEnable = true;

  constructor({ name, path, baudRate, parser, autoStart, readEnable = true }){
    super();
    this.readEnable = readEnable; 
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
        resolve(true);
      });

      const onRead = data => {
        if(!this.readEnable) return;
        log(`${this.name} data:`, data);
        this.packets.push(data);
        if(this.readPromise.resolve){
          const data = this.packets.shift();
          log(`${this.name} read:`, data);
          this.readPromise.resolve(data);
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
    this.check();
    return await new Promise((resolve,reject) => {
      log(`${this.name} write:`, data);
      const result = this.port.write(data, error => error ? reject(error) : resolve(result));
    })
  }

  check(){
    if(!this.port || !this.port.isOpen) {
      throw new Error(`${this.name} port is closed`);
    }
  }

  async flush(){
    this.check();
    if(this.parser){
      await new Promise(resolve => this.parser._flush(resolve));
      this.parser.position = 0;
    }
    await new Promise(resolve => this.port.flush(resolve));
    this.packets = [];
    log(`${this.name} flushed`);
  }

  /**
   * @returns {Promise<Buffer>}
   */
  async read(timeout = 5){
    this.check();

    if(this.packets.length > 0){
      const data = this.packets.shift();
      log(`${this.name} read:`, data);
      return Promise.resolve(data);
    } else {
      return Promise.race([
        new Promise((resolve, reject)=>{
          this.readPromise = {resolve, reject};
        }),
        new Promise((resolve, reject)=>{
          setTimeout(()=>{
            this.readPromise = {resolve: null, reject: null};
            reject(new Error(`${this.name} read timeout`));
          }, timeout*1000);
        })
      ])
    }
  }
}

module.exports = Serial;
