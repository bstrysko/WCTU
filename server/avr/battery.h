#ifndef BATTERY_H
#define BATTERY_H

/* Battery voltage is only updated when VOLTAGE_LOW_ADDR is read, so always
 * read it before VOLTAGE_HIGH_ADDR. */
#define VOLTAGE_LOW_ADDR  0
#define VOLTAGE_HIGH_ADDR 1
#define CHARGING_ADDR     2

#define BATTERY_GROUP     1
#define BATTERY_CHANNEL   0

#define CHARGING_PIN PD2

// Reads whether the battery is charging and the battery's voltage
unsigned char battery_read (char channel, char address);

// Registers battery_read as a callback for spi_read 
void battery_init();

#endif
