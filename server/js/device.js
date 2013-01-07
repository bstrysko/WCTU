/*
 * device.js
 * WCTU - Wirelessly Controlled Testing Unit
 *
 * @ Author - Originally written by Tom Mullins
 			  Redesigned(heavily) and got working by Brent Strysko
 *
 *
 * The device class represents the functionality a WCTU unit has.
 * This class will be shared by both the simulator and the physical
 * implementation.  Originally the dummy server was just going to be written
 * in Javascript(Python before that) however due the asynchronous nature of javascript,
 * the fact NodeJS is really fast, and the plethora of networking and parsing capabilities built
 * into javascript and its basic libraries it was realized that by implementing it in c no significant
 * advantages would be gained.
 *
 * This class checks that the parameters passed in are valid based upon whether the device
 * is being run in emulated mode or not as defined in global.js.  Essentially, if not running
 * in emulated mode, it is much more picky about parameters['devices'] since there is nothing
 * else preventing you from accidentally forgetting to set maximum frequency values, maximum voltage
 * measurement readings, etc.  These cases are not too bad however when we start talking about voltage regulators
 * you could very easily accidentally blow up the entire device. 
 *
 * Some parts are designed such that this class will work from the browser and not NodeJS
 * however as of right now only NodeJS is supported.
 */

/*
 * Only require files if running through
 * NodeJS
 */
if(typeof(window) === 'undefined')
{
	var WebSocketServer = require('ws').Server;
	var Global = require('./global');
}

/*
 * Constructor for the Device class
 *
 * @parameters - 
 * 		port - the port number the device should listen on
 * 		
 *		devices - a 2 dimensional array.  The outmost array
 *		being a collection of device groups ex.) batteries, oscilloscopes, etc
 *		The innermost arrays being a collection of specific devices in a device
 *		group.  All devices in a device group should have unique channels.
 *		If not running in simulation mode device values must be provided.
 *		Should look like:
 *		[
 *			[device1, device2, ...],
 *			[device3, device4, ...],
 *		]	
 *		
 *		where device1 and device2 and device3 and device4 are of the same type	
 */
function Device(parameters)
{
	var self = this;

	if(typeof(parameters) === 'undefined')
	{
		throw new Error("Device has undefined 'parameters'");
	}

	/*
	 * Defaulting to port 80 is okay.
	 */
	if(typeof(parameters.port) === 'undefined')
	{
		parameters.port = 8080;
	}

	if(typeof(parameters.devices) === 'undefined')
	{
		throw new Error("Device has undefined 'parameters.devices'");
	}

	/*
	 * Will look like
	 * {
	 *		device_type_1: {channel_device1: device1, channel_device2: device2, ...},
	 *		device_type_2: {channel_device3: device3, channel_device4: device4, ...},
	 * }
	 */
	this.devices = {};

	for(device_group_index in parameters.devices)
	{
		var device_group = parameters.devices[device_group_index];

		if(device_group.length === 0)
		{
			throw new Error("Cannot have device group with no devices");
		}

		var device_group_name = device_group[0].constructor.name.toLowerCase();

		this.devices[device_group_name] = {};

		for(device_index in device_group)
		{
			if(device_group[device_index].constructor.name.toLowerCase() !== device_group_name)
			{
				throw new Error("Devices in device group #" + group_index + " are not all of the same type '" + device_group_name + "'");
			}

			var channel = device_group[device_index].channel;
			
			if(typeof(channel) === 'undefined')
			{
				throw new Error("Device in device group '" + device_group_name + "' does not have a channel");
			}
			
			this.devices[device_group_name][channel] = parameters.devices[device_group_index][device_index];
		}
	}

	wss = new WebSocketServer({port: parameters.port});

	wss.on('connection', function(ws)
	{
		ws.transmit = [];

		//create transmit array for all devices
		for(device_group in self.devices)
		{
			ws.transmit[device_group] = [];

			for(device in self.devices[device_group])
			{
				ws.transmit[device_group].push(true);
			}
		}

		ws.on('message', function(message)
		{
			try
			{
				message = JSON.parse(message);
			}
			catch (error)
			{
				console.log('WARNING: Invalid JSON message: ' + error);
				return;
			}

			if(typeof(message.type) !== 'undefined')
			{
				if(message.type === 'connection_open')
				{
					if(typeof(message.api) === 'undefined')
					{
						console.log("WARNING: 'connection_open' message missing 'api' field");
					}
					else
					{
						//TODO: add API data to some structure
						ws.client_api = message.api;

						var devices = {};

						for(device_group in self.devices)
						{
							devices[device_group] = Device.get_descriptions(self.devices[device_group]);
						}

						ws.send(JSON.stringify({
							type: 'connection_open',
							version: Global.version,
							devices: devices,
						}));

						//TODO: make this more elegant?
						//maybe have field in device when to send to
						//newly connected client
						self.devices["os"]["0"].send_data(ws);
						self.devices["battery"]["0"].send_data(ws);
					}
				}
				else if(typeof(self.devices[message.type]) !== 'undefined')
				{
					if(typeof(message.channel) === 'undefined')
					{
						console.log("WARNING: " + message.type + " message has missing 'channel' field");
					}
					else if(typeof(self.devices[message.type][message.channel]) === 'undefined')
					{
						console.log("WARNING: " + message.type + " message has invalid 'channel' field");
					}
					else
					{
						if(typeof(message.data) === 'undefined')
						{
							console.log("WARNING: " + message.type + " messages has missing 'data' field");
						}
						else
						{
							self.devices[message.type][message.channel].receive_message(message.data,this.transmit[message.type],message.channel);
						}
					}
				}
				else
				{
					console.log('WARNING: Received message with invalid type:' + message.type);
				}
			}
			else
			{
				console.log('WARNING: Received message with no type');
			}
		});

		ws.on('close',function(){
			console.log("Client disconnected");
		});
	});
	
	for(device_group in this.devices)
	{
		for(device_index in this.devices[device_group])
		{
			var device = this.devices[device_group][device_index];

			device.send_data = function(ws)
			{
				if(typeof(ws) === 'undefined')
				{
					for(var c = 0; c < wss.clients.length; c++)
					{
						this._send_data(wss.clients[c]);
					}
				}
				else
				{
					this._send_data(ws);
				}
			}

			device._send_data = function(ws)
			{
				if(ws.transmit[this.constructor.name.toLowerCase()][parseInt(this.channel)] === true)
				{
					ws.send(JSON.stringify({
						type: this.constructor.name.toLowerCase(),
						channel: this.channel,
						data: this.get_data(),
					}));
				}
			}
		}
	}
}

/*
 * Helper function that returns an array 
 * of device descriptions for devices
 *
 * @returns - an array of descriptions
 */ 
Device.get_descriptions = function(devices)
{
	var descriptions = [];

	for(device_channel in devices)
	{
		descriptions.push(devices[device_channel].get_description());
	}

	return descriptions;
}

/*
 * Only make use of exports if running in NodeJS
 */
if(typeof(window) === 'undefined')
{
	module.exports = Device;
}