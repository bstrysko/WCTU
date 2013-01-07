/*
 * oscilloscope.js
 * WCTU - Wirelessly Controlled Testing Unit
 *
 * @author - Brent Strysko  
 *
 * Class representing an oscilloscope unit
 * on a device.  The values passed in the
 * constructor represent the physical properties
 * of the unit.  For the Dummy Device these values
 * can be made up however in real testing these must
 * be accurate or the hardware can be damaged.
 * If a valid parameters object is not passed in,
 * default values will be assigned.  
 */

/*
 * Only use 'require' if running in NodeJS
 */
if(typeof(window) === 'undefined')
{
	var Global = require('../global');
 	var Base = require("./base");
}

/*
 * Constructor
 */
function Oscilloscope(parameters)
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
	
	if(typeof(parameters.voltages) === 'undefined')
	{
		if(Global.emulated !== true)
		{
			throw new Error("Oscilloscope parameter 'voltages' not provided while running in non-emulated mode");
		}

		parameters.voltages = {};
	}
	
	if(typeof(parameters.voltages.min) === 'undefined')
	{
		if(Global.emulated !== true)
		{
			throw new Error("Oscilloscope parameter 'voltages.min' not provided while running in non-emulated mode");
		}

		parameters.voltages.min = -10;
	}
	
	if(typeof(parameters.voltages.max) === 'undefined')
	{
		if(Global.emulated !== true)
		{
			throw new Error("Oscilloscope parameter 'voltages.max' not provided while running in non-emulated mode");
		}

		parameters.voltages.max = 10;
	}
	
	if(typeof(parameters.frequency) === 'undefined')
	{
		if(Global.emulated !== true)
		{
			throw new Error("Oscilloscope parameter 'frequency' not provided while running in non-emulated mode");
		}

		parameters.frequency = 50;
	}

	if(parameters.frequency < 0)
	{
		throw new Error("Oscilloscope frequency must be greater than 0");
	}

	this.voltages = parameters.voltages;
	this.frequency = parameters.frequency;

	this.data = {
		timestamps: [],
		values: [],
	};

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
		'vscale': {
			handler: function(scale)
			{
				if(scale > 0)
				{
					//TODO: change scale
				}
				else
				{
					console.log("WARNING: Invalid oscilloscope 'scale' value: " + scale);
				}
			},
		},
	};

	/*
	 * Read in data every 1 millisecond
	 */
	setInterval(this.read_data,1,this);
}

/*
 * @description - returns a structure with
 * information about this Oscilloscope instance
 * 
 * @return - description structure with fields
 * channel, voltages, frequency, commands
 */
Oscilloscope.prototype.get_description = function()
{
	return {
		channel: this.channel,
		voltages: {
			min: this.voltages.min, 
			max: this.voltages.max
		},
		frequency: this.frequency,
		commands: this.get_commands(),
	};
}

/*
 * @description - returns a structure with
 * information about this Oscilloscope's calculated
 * data
 *
 * @return - description structure with a field
 * waveform which is an array of n oscilloscope samples.
 */
Oscilloscope.prototype.get_data = function()
{
  return {
    waveform: this.data.values,
  };
}

/*
 * @description - depending upon whether the server
 * is being run in emulated mode or not, make up the data,
 * otherwise read the data from the realworld somehow.  Once
 * the data is created or read in, the send_data function is called
 * after a certain amount of data has been collected because the data
 * being collected is small while the frequency it is being collected at
 * is high.
 *
 * @parameters
 * oscilloscope - instance of the oscilloscope whose data needs to be read.
 * 'this' cannot be used because of the way setInterval works.
 *
 * @return - nothing
 */
Oscilloscope.prototype.read_data = function(oscilloscope)
{
	if(Global.emulated)
	{
		if(typeof(oscilloscope._timer) === 'undefined')
		{
			oscilloscope._timer = Math.floor(Math.random()*10);
		}
		else
		{
			oscilloscope._timer += 0.001;
		}

		oscilloscope.data.timestamps.push(new Date().getTime());
		oscilloscope.data.values.push(10*Math.sin(oscilloscope._timer));
	}
	else
	{
		//TODO: read data from ADC
	}

	if(oscilloscope.data.values.length % 20 === 0)
	{
		oscilloscope.send_data();
		oscilloscope.data.timestamps = [];
		oscilloscope.data.values = [];
	}
}

/*
 * Only make use of exports if running in NodeJS
 */
if(typeof(window) === 'undefined')
{
	module.exports = Oscilloscope;
}
