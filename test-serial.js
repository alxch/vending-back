const { ByteLengthParser, DelimiterParser } = require('serialport');
const log = console.log;
const Serial = require('./serial');

const serial = new Serial({
  name: 'STM',
  path: '/dev/ttyUSB1',
  baudRate: 9600,
  // parser: new ByteLengthParser({ length: 2 }),
  // parser: new DelimiterParser({ delimiter: '\r\n' }),
  // autoStart: true,
});

const test = async () => {
  await serial.start();
  await serial.flush();
  const cmd = 0x01;
  let row = 1, col = 1;
  for(; row <= 6; row++){
    for(; col <= 10; col++){
      await serial.write(Buffer.from([cmd,row,col]));
      await serial.read(10);
    }
  }
}
test();
