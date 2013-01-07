/*
 * base.js
 * WCTU - Wirelessly Controlled Testing Unit
 *
 * @author - Brent Strysko
 *
 * The base class holds the logic that is shared across
 * all devices.  Due to the nature of the devices and
 * the thorough error checking performed by each not much
 * logic is shared as of the current version.  
 */

/*
 * Only use 'require' if running in NodeJS
 */
if(typeof(window) === 'undefined')
{
	var Global = require('../global');
}

/*
 * Constructor
 */
function Base()
{
}

/*
 * Ensures that parameters.channel is valid by ensuring
 * that is values is strictly greater than or equal to 0 
 * and its value has not been taken by any other devices in
 * the same device group.  If parameters.channel is not set
 * a default value will be provided if running in emulated mode
 * otherwise an error is thrown.
 *
 * @parameters
 * parameters - if running in emulated mode can be null otherwise
 * must be non-null and contain a channel field.
 *
 * @returns - nothing
 */
Base.register_device_channel = function(parameters)
{
	/*
	 * If this is the first time the method is called for a device
	 * group set up the static variables 'count' and 'channels'.
	 */
	if(typeof(eval(this.constructor.name).count) === 'undefined')
	{
		eval(this.constructor.name).count = 0;
	}

	if(typeof(eval(this.constructor.name).channels) === 'undefined')
	{
		eval(this.constructor.name).channels = [];
	}

	/*
	 * Only allow 'parameters' to be null if running in emulated mode
	 * If not throw an error.
	 */
	if(typeof(parameters) === 'undefined')
	{
		if(Global.emulated !== true)
		{
			throw new Error(this.constructor.name + " parameters 'undefined' while running in non-emulated mode");
		}	
		else
		{
			parameters = {};
		}
	}	
	
	/*
	 * Only allow 'parameters.channel' to be null if running in emulated mode
	 * If not throw an error.
	 */
	if(typeof(parameters.channel) === 'undefined')
	{
		if(Global.emulated !== true)
		{
			throw new Error(this.constructor.name + " parameter 'channel' not provided while running in non-emulated mode");
		}

		parameters.channel = eval(this.constructor.name).count;
	}

	if(parameters.channel < 0)
	{
		throw new Error(this.constructor.name + " channel " + parameters.channel + " must be greater than or equal to 0");
	}

	/*
	 * If the channel value has not been added before its value should be added
	 * otherwise throw an error because two different devices of the same device group
	 * cannot exist on the same channel.
	 */
	if(eval(this.constructor.name).channels.indexOf(parameters.channel) == -1)
	{
		eval(this.constructor.name).channels.push(parameters.channel);
	}
	else
	{
		throw new Error(this.constructor.name + " already exists on channel " + parameters.channel);
	}

	this.channel = parameters.channel;

	/*
	 * Increment the device group device counter
	 */
	eval(this.constructor.name).count++;
}

/*
 * returns an array containing the names of valid commands
 * for a particular device instance.
 *
 * @returns - an array of a device instance's valid commands
 */
Base.get_commands = function()
{
	var commmand_names_array = ['transmit'];

	for(command in this.commands)
	{
		commmand_names_array.push(command);
	}

	return commmand_names_array;
}

/*
 * receive_message is called on a device whenever a message arives at the
 * server for a valid device group and channel number.
 *
 * @parameters
 * commands - object consisting of command names as the key with the command's argument as the value
 * transmit_device_group_array - array of boolean values determining whether every device in a device group
 * will transmit their broadcasts to a particular client.  Only the value at device_index is needed
 * however if only a boolean is passed in, it will be passed by value not refrence like an array is hence
 * why an array is used.  Only needed for transmit command. 
 * device_index - the index of the device in transmit_device_group_array.  Only needed for transmit command.
 *
 * @return - nothing
 */
Base.receive_message = function(commands,transmit_device_group_array,device_index)
{
	/*
	 * If the user wanted they could place several commands
	 * in one message.
	 */
	for(command in commands)
	{
		/*
		 * transmit is supported by every device.
		 * Handle it specially.
		 */
		if(command === 'transmit')
		{
			/*
			 * If the value provided is a boolean value set it to
			 * that value, else check if it is a toggle request.
			 * If neither then it is considered invalid data.
			 */
			if(typeof(commands[command]) === 'boolean')
			{
				transmit_device_group_array[device_index] = commands[command];
			}
			else if(commands[command] === 'toggle')
			{
				transmit_device_group_array[device_index] = !transmit_device_group_array[device_index];
			}
			else
			{
				console.log("WARNING: " + this.constructor.name + " received invalid transmit: " + commands[command]);
			}
		}
		/*
		 * Check if their is a handler for the command, if so call it.
		 */
		else if(typeof(this.commands[command]) !== 'undefined')
		{
			this.commands[command].handler(commands[command]);
		}
		/*
		 * If there was no handler the client sent an unsupported method name.
		 */
		else
		{
			console.log("WARNING: " + this.constructor.name.toLowerCase() + " sent invalid command: " + command);
		}
	}
}

/*
 * Stub until updated by Device.  Needs to be created by Device
 * because only Device has knowledge about what the clients are.
 * Without knowing this information broadcasts would not be possible.
 *
 * @parameters
 * ws - the websocket(client)
 *
 * @return - nothing
 */
Base.send_data = function(ws){}

/*
 * Only make use of exports if running in NodeJS
 */
if(typeof(window) === 'undefined')
{
	module.exports = Base;
}