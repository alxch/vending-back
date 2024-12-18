const { SerialPort } = require('serialport');
const path = '/dev/ttyUSB0';
const baudRate = 115200;
const port = new SerialPort({ path, baudRate });

port.on('error', error => console.log('STM error:', error));
port.on('data', data => console.log('STM data:', data));

port.write('Hello from RPI');
