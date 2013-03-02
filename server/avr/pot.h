#ifndef POT_H
#define POT_H

// Device group for potentiometers
#define POT_GROUP 11

// Register address of resistor value
#define POT_VALUE_ADDR 0

void pot_init();
void pot_write(char channel, char address, unsigned char value);

#endif
