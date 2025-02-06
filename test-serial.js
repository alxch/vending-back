const { ByteLengthParser, DelimiterParser } = require('serialport');
const Serial = require('./serial');
const log = console.log;

const test = new Serial({
  path: '/dev/ttyUSB0',
  baudRate: 9600,
  name: 'Test',
  // parser: new ByteLengthParser({ length: 2 })
  parser: new DelimiterParser({ delimiter: '\r\n' })
});

await test.start();
await test.write('Hi\r\n');
await test.read();
