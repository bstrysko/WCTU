#ifndef SPI_H
#define SPI_H

#define N_GROUPS 16

typedef void (*write_cb)(char channel, char address, unsigned char msg);
typedef unsigned char (*read_cb)(char channel, char address);

void spi_init();
void spi_register_callbacks(char group, write_cb write, read_cb read);

#endif
