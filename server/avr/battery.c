/* battery.c
 * Authors: Tom Mullins and Srinivasan Vijayaraghavan
 */

#include <avr/io.h>
#include <avr/interrupt.h>
#include "battery.h"
#include "spi.h"

int adc;

unsigned char battery_read (char channel, char address)	{
	if (channel == BATTERY_CHANNEL)	{
		switch(address)	{
			case VOLTAGE_HIGH_ADDR:
				return adc >> 8;		
				break;

			case VOLTAGE_LOW_ADDR:
				return adc & 0xf;		
				break;

			case CHARGING_ADDR:
				return (PIND >> (CHARGING_PIN)) & 0x01;
				break;
		}
  }
	return 0;
}

ISR(ADC_vect) {
	adc = ADC;
}

void battery_init()	{
	/*
	 * REFS = 1, AVcc with external capacitor on AREF pin
	 * ADLAR = 0, right adjust
	 * MUX = 0
	 */
	ADMUX |= _BV(REFS0);

	/*
	 * ADEN = 1, enable ADC
	 * ADSC = 1, start now
	 * ADATE = 1, enable auto trigger
	 * ADIE = 1, enable interrupt
	 * ADPS = 7, prescalar 128
	 */
	ADCSRA = _BV(ADEN) | _BV(ADSC) | _BV(ADATE) | _BV(ADIE) | _BV(ADPS2) |
		_BV(ADPS1) | _BV(ADPS0);

	/*
	 * ADTS = 0, free-running mode
	 */
	ADCSRB = 0;

	spi_register_callbacks(BATTERY_GROUP, 0, battery_read);
}
