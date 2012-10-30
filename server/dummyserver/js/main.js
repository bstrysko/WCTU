var Server = require('./server');
var DummyOScope = require('./dummyoscope');

var device_list = [new DummyOScope(0)];

var srv = new Server(8080, device_list);
