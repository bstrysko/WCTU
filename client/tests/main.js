//true if running in NodeJS
if(typeof window === 'undefined') 
{
	var Device = require("../js/device.js");
}


//checks that device is defined
function test1()
{
	if(typeof Device === "undefined")
	{
		return "Device undefined";
	}
	else
	{
		return true;
	}
}

//attempts to create instance of device
function test2()
{
	try
	{
		var d1 = new Device(A,B);

		return true;
	}
	catch(e)
	{
		return e;
	}
}

function run_tests()
{
	var method_prefix = "test";
	var i = 1;
	var cases_passed = 0;

	while(true)
	{
		try
		{
			var test_result = eval(method_prefix + i + "()");

			if(test_result === true)
			{
				cases_passed++;
				console.log("Passed test case #" + i);
			}
			else
			{
				console.log("Failed test case #" + i);
				console.log("\t" + test_result);
			}

			i++;
		}
		catch(e)
		{
			console.log("Passed " + cases_passed + " / " + (i-1) + " test cases");
			return;
		}
	}
}

run_tests();	