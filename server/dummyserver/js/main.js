var Server = require('./server');
var Battery = require('./battery');
var Oscilloscope = require('./oscilloscope');

var devices = {
  batteries: [new Battery(0)],
  oscilloscopes: [new Oscilloscope(0), new Oscilloscope(1)]
};

var srv = new Server(8080, devices);
