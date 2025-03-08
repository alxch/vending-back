// const { ByteLengthParser, DelimiterParser } = require('serialport');
const Serial = require('./serial');
const log = console.log;

const test = new Serial({
  name: 'Test',
  path: '/dev/ttyUSB0',
  baudRate: 9600,
  autoStart: true,
  // parser: new DelimiterParser({ delimiter: '\r\n' }),
  // parser: new ByteLengthParser({ length: 2 }),
});

// (async()=>{
//   await test.start();
//   await test.write(Buffer.from('34001f0000','hex'));
//   await test.write(Buffer.from('3400000000','hex'));
//   await test.read();
// })();