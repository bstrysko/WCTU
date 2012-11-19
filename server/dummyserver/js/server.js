// true if running in NodeJS
if(typeof window === 'undefined')
{
	var WebSocketServer = require('ws').Server;
}

var version = "1.0.0";

function descriptions(device_list)
{
	return device_list.map(function(dev){
		return dev.get_description();
	});
}

function device_msg_handler(msg, list) {
	if(msg.channel in list)
	{
		return {
			type: msg.type,
			channel: msg.channel,
			data: list[msg.channel].get_data()
		}
	}
	else
	{
		console.log('Invalid channel: '+msg.channel);
	}
}

function Server(port_number, devices)
{
	if(typeof port_number === 'undefined')
	{
		port_number = 80;
	}

	msg_handlers = {
		'connection_open': function(msg){
			// TODO check version, and possibly return type 'error' instead
			return {
				type: 'connection_open',
				version: version,
				devices: {
					batteries: descriptions(devices.batteries),
					oscilloscopes: descriptions(devices.oscilloscopes)
				}
			};
		},
		'battery': device_msg_handler,
		'oscilloscope': device_msg_handler
	};

	wss = new WebSocketServer({port: port_number});
	wss.on('connection', function(ws){
		ws.on('message', function(msg){
			try
			{
				msg = JSON.parse(msg);
			}
			catch (err)
			{
				console.log('Error parsing JSON message: '+err);
				return;
			}
			if('type' in msg)
			{
				if(msg.type in msg_handlers)
				{
					var response = msg_handlers[msg.type](msg);
					ws.send(JSON.stringify(response));
				}
				else
				{
					console.log('Received message with invalid type '+msg.type);
				}
			}
			else
			{
				console.log('Received message with no type');
			}
		});
	});
}

if(typeof window === 'undefined')
{
	module.exports = Server;
}
