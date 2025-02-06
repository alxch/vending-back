const { ByteLengthParser } = require('serialport');
const Serial = require('./serial');
const log = console.log;

const test = new Serial({
  path: '/dev/ttyUSB0',
  baudRate: 9600,
  name: 'Test',
  parser: new ByteLengthParser({ length: 2 })
});

await test.start();
await test.write([0x01,0x02]);
await test.read();
