#include <avr/io.h>
#include <avr/interrupt.h>
#include <util/delay.h>
#include <stdint.h>
#include "spi.h"

write_cb write_callbacks[N_GROUPS];
read_cb read_callbacks[N_GROUPS];

enum state_t {
	WAIT_FOR_COMMAND, WAIT_FOR_ADDRESS, WAIT_FOR_WRITE, IGNORE
} state;

enum action_t {
	READ, WRITE
};

struct command_t {
	int group;
	char channel;
	enum action_t action;
	char address;
} cmd;

static void parse_command(unsigned char msg) {
	cmd.group = msg >> 4;
	cmd.channel = msg & 0xf;
}

static void parse_address(unsigned char msg) {
	cmd.action = (msg&1)? WRITE : READ;
	cmd.address = msg >> 1;
}

static void respond(unsigned char msg) {
	SPDR = msg;
}

ISR(SPI_STC_vect) {
	uint8_t msg = SPDR;
	switch (state) {
		case WAIT_FOR_COMMAND:
			parse_command(msg);
			state = WAIT_FOR_ADDRESS;
			respond(0xff);
			break;
		case WAIT_FOR_ADDRESS:
			parse_address(msg);
			switch (cmd.action) {
				case READ:
					state = IGNORE;
					if (read_callbacks[cmd.group])
						msg = (*read_callbacks[cmd.group])(cmd.channel, cmd.address);
					else
						msg = 0xff;
					respond(msg);
					break;
				case WRITE:
					state = WAIT_FOR_WRITE;
					respond(0xff);
					break;
			}
			break;
		case WAIT_FOR_WRITE:
			if (write_callbacks[cmd.group])
				(*write_callbacks[cmd.group])(cmd.channel, cmd.address, msg);
			state = WAIT_FOR_COMMAND;
			respond(0xff);
			break;
		case IGNORE:
			state = WAIT_FOR_COMMAND;
			respond(0xff);
			break;
	}
}

void spi_register_callbacks(int group, write_cb write, read_cb read) {
	if (0 <= group && group < N_GROUPS) {
		write_callbacks[group] = write;
		read_callbacks[group] = read;
	}
}

void spi_init() {
	state = WAIT_FOR_COMMAND;
	DDRB |= _BV(PB4);
	SPCR |= _BV(SPE) | _BV(SPIE);
	respond(0xff);
}

unsigned char test[128];

void test_write(char channel, char address, unsigned char msg) {
	test[(int)address] = msg;
}

unsigned char test_read(char channel, char address) {
	return test[(int)address];
}

int main() {
	sei();
	spi_init();
	spi_register_callbacks(1, test_write, test_read);
	while (1) {
	}
	return 0;
}
