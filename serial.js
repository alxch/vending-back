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
      
      this.port.on('open', () => { 
        console.log(`${this.name} opened`); 
        resolve(`${this.name} opened`);
      });
      this.port.on('data', data => {
        // just log
        console.log(`${this.name} data:`, data);
      });
      this.port.on('error', error => { 
        console.log(`${this.name} error:`, error.message); 
        reject(error); 
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

  async read(){
    return await new Promise((resolve,reject) => {
      this.port.once('error', reject);
      this.port.once('data', resolve);
    });
  }

  readAsync(onData, onError){
    this.port.once('error', error => {
      onError(error);
      this.port.un('data', onData);
    });
    this.port.on('data', onData);
    return ()=>{
      this.port.un('data', onData);
    };
  }
}

module.exports = Serial;
