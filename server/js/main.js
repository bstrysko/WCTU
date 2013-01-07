/*
 * main.js
 * WCTU - Wirelessly Controlled Testing Unit
 *
 * @ Author - Brent Strysko
 *
 * This file does not define class but instead of 
 * initializes a server to a specific port number and
 * to a device group array devices.
 */

/*
 * Only use 'require' if running in NodeJS
 */
if(typeof(window) === 'undefined')
{
  var Device = require('./device');
  var OS = require('./devices/os');
	var Battery = require('./devices/battery');
	var Oscilloscope = require('./devices/oscilloscope');
}

var devices = 
[
  [
    new OS({channel: 0}),
  ],
  [
  	new Battery({channel: 0, rating: 3200}),
  ],
  [
  	new Oscilloscope({channel: 0, voltages: {min: -10,max: 10},frequency: 50}), 
  	new Oscilloscope({channel: 1, voltages: {min: -10,max: 10},frequency: 50}),
  ],
];

var device = new Device({
  port:8080,
  devices: devices,
});