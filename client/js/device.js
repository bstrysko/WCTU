//true if running in NodeJS
if(typeof window === 'undefined') 
{
	var WebSocket = require('ws');
	var API = require('./api'); 
}


function Device(device_address,port_number)
{
	if(typeof port_number === 'undefined')
	{
		port_number = 80;
	}

  	this.websocket = new WebSocket('ws://' + device_address + ":" + port_number);
    this.server_data = {};
    
	var ws   = this.websocket;
    var server_data = this.server_data;
    server_data.dynamic = {};
    server_data.dynamic.oscilloscope = [];
    	
    // on connection, send info
	ws.on('open',function(){
		console.log("Connected to " + device_address + " on port " + port_number);
	
		var message = {
			type: "connection_open",
			api: 
			{ 
				version : API.version 
			},
		};

		ws.send(message);
	});

    // messages from server
	ws.on('message',function(message){
        // first message sent back
        if(message["type"] == "connection_open")
		{
            console.log(device_address + " : " + port_number + " says connection_open");
            
            server_data.version = message["version"];
            server_data.battery = message["battery"];
            server_data.devices = message["devices"];
            
		}
        // oscilloscope messages
		else if(message["type"] == "oscilloscope")
        {
            console.log(device_address + " : " + port_number + " says oscilloscope");
            
            var channel = message["channel"];
            server_data.dynamic.oscilloscope[channel] = message["data"];
            
        }
        // battery messages
        else if(message["type"] == "battery")
        {
            console.log(device_address + " : " + port_number + " says battery");
            
            var channel = message["channel"];
            server_data.dynamic.battery[channel] = message["data"];

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