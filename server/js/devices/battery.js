/*
 * battery.js
 * WCTU - Wirelessly Controlled Testing Unit
 *
 * @author - Brent Strysko
 *
 * The battery class represents an battery that may
 * be present on the device.  As of right there are 
 * no commands that can be sent to a battery except
 * 'transmit', which is supported by all devices.
 */

/*
 * Only use 'require' if running in NodeJS
 */
if(typeof(window) === 'undefined')
{
 	var Global = require('../global');
 	var Base = require('./base');
 	var SPI = require('../spi');
}

/*
 * Constructor
 */
function Battery(parameters)
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
	 * Check the rest of the values that could be
	 * in parameters.
	 */
	if(typeof(parameters.rating) === 'undefined')
	{
		if(Global.emulated !== true)
		{
			throw new Error("Battery parameter 'rating' not provided while running in non-emulated mode");
		}

		parameters.rating = 1000;
	}
	
	if(parameters.rating < 0)
	{
		throw new Error("Battery rating must be greater than 0");
	}

	this.rating = parameters.rating;

	/*
	 * Initialize where the data will be stored to
	 */
	this.data = {};
	this.data.charging = null;
	this.data.voltage = null;

	/*
	 * Values that will be calculated based
	 * upon the collected data
	 */
	this.life = -1;
	this.time_remaining = -1;

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
	 * Battery device group id on the SPI bus
	 */
	this.battery_group_id = 0x1;

	/*
	 * Valid register values that can be written to the
	 * SPI bus
	 */
	this.registers = {};
	this.registers.voltage_lsb = 0x0;
	this.registers.voltage_msb = 0x1;
	this.registers.charging = 0x2;

	/*
	 * Read in data every 2 seconds(1000 milliseconds/second)*2 seconds
	 */
	setInterval(this.read_data,2000/*60000*/,this);
}

/*
 * Returns a structure with
 * information about this Battery instance
 * 
 * @return - description structure with fields
 * channel, rating, and commands
 */
Battery.prototype.get_description = function()
{
	return {
		channel: this.channel,
		rating: this.rating,
		commands: this.get_commands(),
	};
}

/*
 * Returns a structure with
 * information about this Battery instances calculated
 * data
 *
 * @return - description structure with fields
 * life(%battery_life) and time_remaining(seconds until)
 * battery will run out.  If either field is -1, it cannot
 * be calculated for this Battery instance.
 */
Battery.prototype.get_data = function()
{
	return {
		life: this.life,
		time: this.time_remaining,
		charging: this.data.charging,
	}
}

/*
 * Depending upon whether the server
 * is being run in emulated mode or not, make up the data,
 * otherwise read the data from the realworld somehow.  Once
 * the data is created or read in, the send_data function is called
 * immediately and not buffered because battery information messages
 * are transmitted at low frequencies.
 *
 * @parameters
 * battery - instance of the battery whose data needs to be read.
 * 'this' cannot be used because of the way setInterval works.
 *
 * @return - nothing
 */
Battery.prototype.read_data = function(battery)
{	
	if(Global.emulated)
	{
		if(battery.life === -1)
		{
			battery.life = 100;
		}
		else
		{
			battery.life -= 0.001;
		} 

		battery.time_remaining = -1;
	}
	else
	{
		/*
		 * Read battery voltage LSB
		 */
		SPI.read(0,battery.battery_group_id,battery.channel,battery.registers.voltage_lsb,function(lsb){
			battery.data.voltage = lsb & 0xFF;
			
			/*
			 * Read battery voltage MSB
			 */
			SPI.read(0,battery.battery_group_id,battery.channel,battery.registers.voltage_msb,function(msb){
				battery.data.voltage |= (msb << 0x8) & 0x200;
				console.log(battery.data.voltage);

				/*
				 * Read if the battery is charging or not.
				 */
				SPI.read(0,battery.battery_group_id,battery.channel,battery.registers.charging,function(charging){
					battery.data.charging = (charging) ? true: false;
					console.log(battery.data.charging);
				});

			});
		});
	}

	battery.send_data();
}

/*
 * Only make use of exports if running in NodeJS
 */
if(typeof(window) === 'undefined')
{
	module.exports = Battery;
}
