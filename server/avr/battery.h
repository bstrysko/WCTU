#DEFINE VOLTAGE_ADDR 0
#DEFINE CHARGING_ADDR 1
#DEFINE BATTERY_CHANNEL 0
#DEFINE CHARGING_PIN PD2

// Reads whether the battery is charging and the battery's voltage
unsigned char battery_read (char channel, char address);

// Registers battery_read as a callback for spi_read 
void battery_init();

