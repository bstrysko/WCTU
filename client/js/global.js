var Global = {
	version : "1.0.0"
};

//true if running in NodeJS
if(typeof(window) === 'undefined') 
{
	module.exports = Global;
}