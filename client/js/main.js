var Device = require("./device");

var callback = function(device,message)
{
	if(message.type === 'os')
	{
		console.log("OS:");
		console.log("  Uptime: " + message.data.uptime);
		console.log("  Load Average(1): " + message.data.load_average[0]);
		console.log("  Load Average(5): " + message.data.load_average[1]);
		console.log("  Load Average(15): " + message.data.load_average[2]);
		console.log("  Free Memory: " + message.data.free_memory);
		console.log("  Total Memory: " + message.data.total_memory);
	}
	else if(message.type === 'battery')
	{
		console.log("Battery:");
		console.log("  Channel: " + message.channel);
		console.log("  Data-Life: " + message.data.life);
		console.log("  Data-Time: " + message.data.time);
	}
	else if(message.type === 'oscilloscope')
	{
		console.log("Oscilloscope:");
		console.log("  Channel: " + message.channel);

		for(i in message.data.waveform)
		{
			console.log("  " + message.data.waveform[i]);
		}
	}
}

function main()
{
	var d1;

	process.stdin.resume();
	process.stdin.setEncoding('utf8');
	process.stdin.setRawMode(true);

	process.stdin.on('data',function(c){
		//Ctrl-C 
  		if (c == '\3')
  		{ 
		    process.exit(0); 
		}
		else if(c === 't')
		{
			//TODO: toggle transmission from all oscilloscopes
			d1.send_command("oscilloscope",0,{
				transmit: false,
			});
		} 
		else 
		{ 
		    process.stdout.write(c); 
		} 
	});

	d1 = new Device({url: "localhost:8080"},callback);
}

main();