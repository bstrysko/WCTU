/* battery.c
 * Authors: Tom Mullins and Srinivasan Vijayaraghavan
 */

#include <avr/io.h>
#include "battery.h"
#include "spi.h"

unsigned char battery_read (char channel, char address)	{
	if (channel == BATTERY_CHANNEL)	{
		switch(address)	{
			case (VOLTAGE_ADDR):
				//TODO
				return 0;		
				break;

			case (CHARGING_ADDR):
				return (PIND >> (CHARGING_PIN)) & 0x01;
				break;
		}
	
	return 0;
}

void battery_init()	{
	spi_register_callbacks(BATTERY_CHANNEL, NULL, battery_read);
}
