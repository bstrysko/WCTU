// true if running in NodeJS
if(typeof window === 'undefined')
{
	var WebSocketServer = require('ws').Server;
}

var version = "1.0.0";

function has_type(type)
{
	return function(obj){
		return obj.type === type;
	}
}

function descriptions_by_type(device_list, type)
{
	var devs = device_list.filter(has_type(type));
	return devs.map(function(dev){
		return dev.get_description();
	});
}

function Server(port_number, device_list)
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
				battery: {rating: 2000},
				devices: {
					oscilloscopes: descriptions_by_type(device_list, 'oscilloscope')
				}
			};
		}
		// TODO add 'oscilloscope' message type
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
