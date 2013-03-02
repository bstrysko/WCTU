#include <stdlib.h>
#include "pot.h"
#include "spi.h"
#include "twi.h"

#define POT_BASE_I2C_ADDRESS 0x28
#define POT_CMD_WR0 0xA9
#define POT_CMD_WR1 0xAA

struct pot_addr {
  unsigned char i2c_addr;
  char pot_number;
};

struct pot_addr addrs[] = {
  {0x28, 0}
};
#define POT_N_CHANNELS sizeof(addrs)/sizeof(struct pot_addr)

void pot_init() {
  spi_register_callbacks(POT_GROUP, pot_write, 0);
}

void pot_write(char channel, char address, unsigned char msg) {
  unsigned char buf[2];
  if (address == POT_VALUE_ADDR && 0 <= channel
      && (size_t)channel < POT_N_CHANNELS) {
    buf[0] = addrs[(short)channel].pot_number? POT_CMD_WR1 : POT_CMD_WR0;
    buf[1] = msg;
    twi_writeTo(addrs[(short)channel].i2c_addr, buf, sizeof(buf), 0);
  }
}
