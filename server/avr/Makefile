PART=m328p
MCU=atmega328p

PROG=avrispMKII

F_CPU=20000000
FLAGS=-mmcu=$(MCU) -DF_CPU=$(F_CPU)UL -Os -Wall

default: spi.hex

%.hex: %.elf
	avr-objcopy -j .text -j .data -O ihex $< $@

spi.elf: spi.c spi.h
	avr-g++ $(FLAGS) spi.c -o spi.elf

program: spi.hex
	avrdude -p $(PART) -c $(PROG) -P usb -B 1 -U flash:w:spi.hex
