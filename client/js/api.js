var API = {
	version : "1.0"
};

//true if running in NodeJS
if(typeof window === 'undefined') 
{
	module.exports = API;
}