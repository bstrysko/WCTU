var Global = {
	emulated: true,
	version: "1.0.0",
}

if(typeof(window) === 'undefined')
{
	module.exports = Global;
}