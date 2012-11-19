function Battery(channel)
{
	if(typeof channel === 'undefined')
	{
		channel = 0;
	}
	this.channel = channel;
	this.type = 'battery';
}

Battery.prototype.get_description = function()
{
	return {
		channel: this.channel,
		rating: 2000
	};
}

if(typeof window === 'undefined')
{
	module.exports = Battery;
}
