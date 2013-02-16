/*
 * global.js
 * WCTU - Wirelessly Controlled Testing Unit
 *
 * @ Author - Brent Strysko
 *
 * A global static class that holds the server's version #
 * and whether the server is being run in emulated mode or not.
 * This is an independent class seperate from the global space
 * of either a browser or NodeJS in order to not pollute that scope.
 */

var Global = {
	emulated: true,
	version: "1.0.0",
}

/*
 * Only make use of exports if running in NodeJS
 */
if(typeof(window) === 'undefined')
{
	module.exports = Global;
}
