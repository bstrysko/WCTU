/* battery.c
 * Authors: Tom Mullins and Srinivasan Vijayaraghavan
 */

#include <avr/io.h>
#include <avr/interrupt.h>
#include "battery.h"
#include "spi.h"

/* adc_current is updated by the interrupt. When VOLTAGE_LOW_ADDR is read, it
 * will atomically read adc_current into adc_buffer and use that value. Later
 * when VOLTAGE_HIGH_ADDR is read, it still uses the value in adc_buffer to
 * eliminate race conditions. */
int adc_current, adc_buffer;

unsigned char battery_read (char channel, char address)	{
	if (channel == BATTERY_CHANNEL)	{
		switch(address)	{
			case VOLTAGE_LOW_ADDR:
				cli();
				adc_buffer = adc_current;
				sei();
				return adc_buffer & 0xff;
				break;

			case VOLTAGE_HIGH_ADDR:
				return adc_buffer >> 8;		
				break;

			case CHARGING_ADDR:
				return (PIND >> (CHARGING_PIN)) & 0x01;
				break;
		}
  }
	return 0;
}

ISR(ADC_vect) {
	adc_current = ADC;
}

void battery_init()	{
	/*
	 * REFS = 0, AREF
	 * ADLAR = 0, right adjust
	 * MUX = 0
	 */
	ADMUX = 0;

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
