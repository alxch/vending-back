const { SerialPort } = require('serialport');

const stm = {
  /** @type {SerialPort} */
  port: null, 
  start({ path, baudRate }){
    this.port = new SerialPort({ path, baudRate });
    this.port.on('error', error => console.log('STM error:', error.message));
    this.port.on('data', data => console.log('STM data:', data));
    this.port.write('Hello from RPI');
  },
  sel({col, row, count}){
    this.port.write();
  }
};

module.exports = stm;
