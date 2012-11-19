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

Battery.prototype.get_data = function()
{
  return {
    life: 30,
    time: 20
  }
}

if(typeof window === 'undefined')
{
	module.exports = Battery;
}
