/*
 * spi.js
 * WCTU - Wirelessly Controlled Testing Unit
 *
 * @ Author - Brent Strysko
 *
 * A global static class that holds information
 * about the available SPI busses and provides a
 * protocol to communicate through them that all 
 * SPI slaves devices on the buses adhere to.
 * 
 * The first byte sent is the command byte
 * organized as
 * Bits [7-4] - group the message should go to
 * Bits [3-0] - channel inside the group the message should go to
 *
 * The first byte by the slave device is thus a garbage
 * byte and should be ignored.
 *
 * The master then transmits a byte specfying the register it wants
 * to write/read to.
 * Bits [7-1] - 7 bit register address
 * Bits [0] - 1 for write to the specified address, 0 read
 *
 * If it is a read the master transmits 0xFF and receives the result.
 * If it is a write the master then transmits the new value and receives
 * the old value of the register. 
 */

/*
 * Only use 'require' if running in NodeJS
 * The spi library will only compile on the actual hardware
 * thus even if we are running through Node we can only require
 * the library if not running in emulation mode.
 */
if(typeof(window) === 'undefined')
{
	var _SPI = function()
	{
		try
		{ 
			return require('spi');
		}
		catch(e)
		{
			return null;
		}
	}();
}

var SPI = {
};

SPI.init = function()
{
	if(typeof(this.bus) === 'undefined')
	{
		this.bus = [];

		/*
		 * SPI devices only exist when not in emulation mode and on correct hardware
		 */
		if((typeof(window) === 'undefined') && (_SPI !== null))
		{
			this.bus.push(
				new _SPI.Spi('/dev/spidev0.0',
				{
					'mode': _SPI.MODE['MODE_0'], // always set mode as the first option
					'chipSelect': _SPI.CS['low'], // 'none', 'high' - defaults to low
					'maxSpeed': 400000
				}, function(s){s.open();})
			);
		}
	}	
}

SPI.transfer = function(spi_bus,device_group,device_channel,register_address,write_value,callback)
{
	var device_info = (device_group << 0x4) & 0xF0;
	device_info |= (device_channel) & 0xF;

	var register_info = (register_address << 0x1) & 0xFE;
	var write = (write_value !== null);
	register_info |= (write) & 0x1;

	var value = (write)?(write_value):(0xFF);

	var tx_buffer = new Buffer([device_info,register_info,value]);
	var rx_buffer = new Buffer([0x00,0x00,0x00]);

	this.bus[spi_bus].transfer(tx_buffer, rx_buffer, function(device, buf) {
		callback(buf.readUInt8(2));
	});
}

SPI.read = function(spi_bus,device_group,device_channel,register_address,callback)
{
	this.transfer(spi_bus,device_group,device_channel,register_address,null,callback);
}

SPI.write = function(spi_bus,device_group,device_channel,register_address,write_value,callback)
{
	this.transfer(spi_bus,device_group,device_channel,register_address,write_value,callback);
}

/*
 * Only make use of exports if running in NodeJS
 */
if(typeof(window) === 'undefined')
{
	module.exports = SPI;
}
