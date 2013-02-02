#include <avr/io.h>
#include <avr/interrupt.h>
#include <util/delay.h>
#include <stdint.h>

enum state_t {
  WAIT_FOR_COMMAND, RESPOND
} state;

ISR(SPI_STC_vect) {
  uint8_t in = SPDR;
  if (in == 0xFF) {
    SPDR = 0;
    state = WAIT_FOR_COMMAND;
  } else {
    switch (state) {
      case WAIT_FOR_COMMAND:
        if (in == 0x01) {
          SPDR = (PIND >> PD4) & 1;
          state = RESPOND;
        }
        break;
      case RESPOND:
        SPDR = 0;
        state = WAIT_FOR_COMMAND;
        break;
    }
  }
}

void spi_init() {
  DDRB |= _BV(PB4);
  SPCR |= _BV(SPE) | _BV(SPIE);
}

int main() {
  sei();
  state = WAIT_FOR_COMMAND;
  spi_init();
  while (1) {
  }
  return 0;
}
