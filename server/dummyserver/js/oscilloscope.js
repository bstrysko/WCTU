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

Oscilloscope.prototype.get_data = function()
{
  return {
    waveform: [ -30 , 30 , 10 , 10.4 , -11.2 , 5.4 ]
  };
}

if(typeof window === 'undefined')
{
	module.exports = Oscilloscope;
}
