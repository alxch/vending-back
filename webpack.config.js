const path = require('path');

module.exports = {
  target: 'node', 
  entry: './www', 
  output: {
    filename: 'back.js',
    path: path.resolve(__dirname, './'),
  },
  mode: 'production', //
  // Additional configuration goes here
};
