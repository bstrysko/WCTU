function Oscilloscope(channel)
{
	if(typeof channel === 'undefined')
	{
		channel = 0;
	}
	this.channel = channel;
	this.type = 'oscilloscope';
}

Oscilloscope.prototype.get_description = function()
{
	return {
		channel: this.channel,
		voltages: {min: -20, max: 20},
		frequency: 50
	};
}

if(typeof window === 'undefined')
{
	module.exports = Oscilloscope;
}
