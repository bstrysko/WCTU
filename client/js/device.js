//true if running in NodeJS
if(typeof window === 'undefined') 
{
	var WebSocket = require('ws');
	var API = require('./api'); 
}


function Device(device_address,port_number)
{
	if(port_number === 'undefined')
	{
		port_number = 80;
	}

	var ws = this.websocket;

	ws = new WebSocket('ws://' + device_address + ":" + port_number);
	
	ws.on('open',function(){
		console.log("Connected to " + device_address + " on port " + port_number);
	
		var message = {
			type: "connection_open",
			api: 
			{ 
				version : API.version 
			},
		};

		ws.websocket.send(message);
	});

	ws.on('message',function(message){
		if(message["type"] == "on_open")
		{

		}
	});
}

Device.prototype.getBatteryLife = function()
{

}

//true if running in NodeJS
if(typeof window === 'undefined') 
{
	module.exports = Device;
}