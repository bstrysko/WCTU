#include <avr/interrupt.h>
#include "battery.h"
#include "spi.h"
#include "twi.h"
#include "pot.h"

int main() {
	sei();
  twi_init();
	spi_init();
	battery_init();
  pot_init();
	while (1) {
	}
	return 0;
}
