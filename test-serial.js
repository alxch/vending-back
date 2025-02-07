const { ByteLengthParser, DelimiterParser } = require('serialport');
const Serial = require('./serial');
const log = console.log;

const bill = new Serial({
  name: 'Bill',
  path: '/dev/ttyUSB0',
  baudRate: 9600,
  // parser: new ByteLengthParser({ length: 2 })
  parser: new DelimiterParser({ delimiter: '\r\n' }),
  "autoStart": true,
  // readEnable: false
});

await bill.start();
await bill.write(Buffer.from('34001f0000','hex'));
await bill.write(Buffer.from('3400000000','hex'));
await bill.read();
