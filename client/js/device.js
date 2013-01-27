/*
 * Only use 'require' if running in NodeJS
 */
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

    self.callback = callback;
    self.message_queue = [];

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
                console.log('WARNING: Invalid JSON message: ' + error);
                return;
            }

            self.handle_message(self,message);
        });

		ws.send(JSON.stringify({
            type: "connection_open", 
            api: {
                version: Global.version
            }, 
        }));
	});
}

Device.prototype.handle_message = function(self,message)
{
    if(message.type === "connection_open")
    {
        if(typeof(message.version) === 'undefined')
        {
            console.log("'message.version' 'undefined' in message of type 'connection_open'");
            return;
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

        self.devices = {};

        for(device_group_index in message.devices)
        {
            self.devices[device_group_index] = {};

            for(device_index in message.devices[device_group_index])
            {
                var channel = message.devices[device_group_index][device_index].channel;

                self.devices[device_group_index][channel] = message.devices[device_group_index][device_index];
            }
        }

        /*
         * Process any messages that may have come in through the message_queue before connection_open
         * was received
         */
        for(message_i in self.message_queue)
        {
            self.handle_message(self,self.message_queue[message_i])
        }
    }
    /*
     * Did not receive connection_open message yet.
     */
    else if(typeof(self.devices) === 'undefined')
    {
        self.message_queue.push(message);
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
            self.callback(self,message);
        }
    }
    else
    {
        console.log("WARNING: Invalid message type: " + message.type);
    }
}

/*
 * Sends a command to the device group type on the channel specified.
 * If channel is -1, the command is sent to all devices in that device group.
 * Data is an object with key-value pairs of the command and its one value argument.
 * If the type and channel are invalid the message is not sent.
 *
 * @parameters
 * type - device group name
 * channel - device channel on device group.  Can be -1 to broadcast to all devices in the group.
 * data - object containing the command argument key value pairs
 *
 * @return - nothing
 */
Device.prototype.send_command = function(type,channel,data)
{
    if(typeof(this.devices[type]) !== 'undefined')
    {
        if((channel === -1) || (typeof(this.devices[type][channel]) !== 'undefined'))
        {
            this.ws.send(JSON.stringify({
                type: type,
                channel: channel,
                data: data,
            }));
        }
        else
        {
            console.log("WARNING: " + channel + " is an invalid channel # for " + type + ".  Message " + JSON.stringify(data) + " not sent");
        }
    }
    else
    {
        console.log("WARNING: " + type + " is not a valid device group.  Message " + JSON.stringify(data) + " not sent");
    }
}

/*
 * Only make use of exports if running in NodeJS
 */
 if(typeof(window) === 'undefined') 
{
	module.exports = Device;
}