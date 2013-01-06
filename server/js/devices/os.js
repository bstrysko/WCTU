/*
 * os.js
 * WCTU - Wirelessly Controlled Testing Unit
 *
 * @author - Brent Strysko
 *
 * The OS class represents the main computing
 * resource and all of its immediate peripherals.
 * The data provided by this class is not necessary
 * though may become useful later for benchmarking
 * and maximing effeciency.
 */

/*
 * Only use 'require' if running in NodeJS
 */
if(typeof(window) === 'undefined')
{
	var os = require("os");
	var Global = require("../global");
	var Base = require("./base");
}

/*
 * Constructor
 */
function OS(parameters)
{
	/*
	 * 'Extend' the Base class.
	 */
	for(e in Base)
	{
		this[e] = Base[e];
	}

	/*
	 * Make sure parameters.channel is valid based upon
	 * what mode the server is being run in and if valid
	 * register the channel number for the device group
	 * 'Battery'
	 *
	 * Need to invoke the contents of the function
	 * through eval otherwise you cannot see Battery
	 * through the scope of Base which is where the function
	 * contents reside.
	 */
	var code = this.register_device_channel.toString();
	eval(code.substring(code.indexOf("{") + 1, code.lastIndexOf("}")));

	/*
	 * Structure of valid commands that could be sent to the instance
	 * of this device.  Each entry must have the format
	 * command_name : {
	 *		handler: function(variable)
	 *		{
	 *		},
	 *	},
	 */
	this.commands = {
	};

	/*
	 * Read in data every 1 minute(1000 milliseconds/second)*60 seconds/1 minute
	 */
	setInterval(this.read_data,60000,this)
}

/*
 * @description - returns a structure with
 * information about this OS instance
 * 
 * @return - description structure with fields
 * arch, platform, cpu, network, and commands
 */
OS.prototype.get_description = function()
{
	return {
		arch: os.arch(),
		platform: os.platform(),
		cpu: os.cpus(),
		network: os.networkInterfaces(),
		commands: this.get_commands(),
	};
}

/*
 * @description - returns a structure with
 * information about this OS instances data
 *
 * @return - description structure with fields
 * uptime load_average, free_memory, and total_memory.
 * If any field is -1, it means its value could not be
 * calculated using this hardware. 
 */
OS.prototype.get_data = function()
{
	return {
		uptime: os.uptime(),
		load_average: os.loadavg(),
		free_memory: os.freemem(),
		total_memory: os.totalmem(),
	}
}

/*
 * @description -  immediately send the data since get_data
 * retreives updated information through the use of it's os functions.
 * Do not buffer the data since this device sends messages at low frequencies.
 *
 * @parameters
 * os - instance of the os whose data needs to be read/sent.
 * 'this' cannot be used because of the way setInterval works.
 *
 * @return - nothing
 */
OS.prototype.read_data = function(os)
{
	os.send_data();
}

/*
 * Only make use of exports if running in NodeJS
 */
if(typeof(window) === 'undefined')
{
	module.exports = OS;
}