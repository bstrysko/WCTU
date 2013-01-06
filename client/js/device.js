//true if running in NodeJS
if(typeof(window) === 'undefined') 
{
	var WebSocket = require('ws');
	var Global = require('./global');
}

function Device(parameters,callback)
{
	if(typeof(parameters) === 'undefined')
	{
        throw new Error("Device 'parameters' is 'undefined'");
	}
    else if(typeof(parameters.url) === 'undefined')
    {
        throw new Error("Device 'parameters.url' is 'undefined'");
    }
    else if(typeof(callback) === 'undefined')
    {
        throw new Error("Device 'callback' is 'undefined'");
    }

    var self = this;

  	this.ws = new WebSocket('ws://' + parameters.url);
	var ws = this.ws;
    	
    // on connection, send info
	ws.on('open',function(){
		console.log("Sucessfully connected to Device @ " + parameters.url);
	
        // messages from server
        ws.on('message',function(message)
        {
            try
            {
                message = JSON.parse(message);
            }
            catch (error)
            {
                console.log('ERROR: Invalid JSON message: ' + error);
                return;
            }

            if(message.type === "connection_open")
            {
                if(typeof(message.version) === 'undefined')
                {
                    console.log("'message.version' 'undefined' in message of type 'connection_open'");
                    return
                }
                else if(Global.version < message.version)
                {
                    console.log("Client version '" + Global.version + "' cannot support Device version '" + message.version + "'");
                    return;
                }
                else if(typeof(message.devices) === 'undefined')
                {
                    console.log(message.type + " has no message.devices");
                    return;
                }
                
                self.version = message.version;
                self.devices = message.devices;
            }
            //check that type is of a valid device
            else if(typeof(self.devices[message.type]) !== 'undefined')
            {
                if(typeof(message.channel) === 'undefined')
                {
                    console.log("Message of type '" + message.type + "' has no channel field");
                }
                else if(typeof(self.devices[message.type][message.channel]) === 'undefined')
                {
                    console.log("Message of type '" + message.type + "' has an invalid channel: " + message.channel);
                }
                else
                {
                    callback(self,message);
                }
            }
            else
            {
                console.log("WARNING: Invalid message type: " + message.type);
            }
        });

		ws.send(JSON.stringify({
            type: "connection_open", 
            api: {
                version: Global.version
            }, 
        }));
	});
}

Device.prototype.send_command = function(type,channel,data)
{
    this.ws.send(JSON.stringify({
        type: type,
        channel: channel,
        data: data,
    }));
}

//true if running in NodeJS
if(typeof(window) === 'undefined') 
{
	module.exports = Device;
}