const {SerialPort} = require('serialport');
const port = new SerialPort({path:'/dev/ttyUSB0',baudRate:/* 115200 */9600});

let msg = '';
port.on('data',data=>{
  console.log("Dat:", data);
  let res = msg + data.toString();
  const idx = res.indexOf('\r\n');
  if(idx != -1){
    msg = res.slice(0,idx);
    res = res.slice(idx+2);
    console.log('Msg:',msg+'[rn]'+res);
    msg = res;
  } 
});
port.on('error',console.log);

port.write(Buffer.from('010101','hex'));
// port.write(Buffer.from('3400000000','hex'));
// port.write(Buffer.from('34001f0000','hex'));
