const { SerialPort } = require('serialport');
const path = '/dev/ttyUSB0';
const baudRate = 115200;

const stm = {
  port: null,
  start(){
    const port = stm.port = new SerialPort({ path, baudRate });
    
    port.on('error', error => console.log('STM error:', error.message));
    port.on('data', data => console.log('STM data:', data));
    
    port.write('Hello from RPI');
  }
};

module.exports = stm;
