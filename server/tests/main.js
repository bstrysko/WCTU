//true if running in NodeJS
if(typeof window === 'undefined') 
{
	var DummyServer = require("../js/dummy_server.js");
}

//checks that DummyServer is defined
function test1()
{
	if(typeof DummyServer === "undefined")
	{
		return true;	
	}
	
	return "DummyServer undefined";
}

//attempts to create instance of DummyServer
//on port 8080 with default devices
function test2()
{
	try
	{
		var dummy_server = new DummyServer(8080,devices);

		if(dummy_server.get_port_number() == 80080)
		{
			return true;
		}
		else
		{

		}
	}
	catch(e)
	{
		return e;
	}

	return false;
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