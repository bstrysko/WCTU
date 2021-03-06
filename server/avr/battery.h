#ifndef BATTERY_H
#define BATTERY_H

#define BATTERY_CHANNEL 0

#define CHARGING_PIN PD2

// Reads whether the battery is charging and the battery's voltage
unsigned char battery_read(char channel, char address);

// Registers battery_read as a callback for spi_read 
void battery_init();

#endif
