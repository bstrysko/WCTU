#include <avr/io.h>
#include <avr/interrupt.h>
#include <util/delay.h>

/*
 * 64 prescalar, 20MHz / 64 / 13 -> ~41us per sample
 */

int main() {
  DDRD = 0xff;
  DDRB = _BV(DDB0);
  ADMUX = _BV(ADLAR);
  ADCSRA = _BV(ADEN) | _BV(ADSC) | _BV(ADATE) | _BV(ADIE) | _BV(ADPS2) |
      _BV(ADPS1);
  sei();
  while (1);
  return 0;
}

ISR(ADC_vect) {
  PORTD = ADCH;
  PORTB |= _BV(PB0);
  _delay_us(10);
  PORTB &= ~_BV(PB0);
}
