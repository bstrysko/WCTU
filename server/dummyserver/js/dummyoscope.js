function DummyOScope(channel)
{
	if(typeof channel === 'undefined')
	{
		channel = 0;
	}
	this.channel = channel;
	this.type = 'oscilloscope';
}

DummyOScope.prototype.get_description = function()
{
	return {
		channel: this.channel,
		voltages: {min: -20, max: 20},
		frequency: 'lol, with JSON probably like 2 Hz lol'
	};
}

if(typeof window === 'undefined')
{
	module.exports = DummyOScope;
}
