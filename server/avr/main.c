#include <avr/interrupt.h>
#include "battery.h"
#include "spi.h"

int main() {
	sei();
	spi_init();
	battery_init();
	while (1) {
	}
	return 0;
}
