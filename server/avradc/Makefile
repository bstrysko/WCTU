PART=m328p
MCU=atmega328p

PROG=avrispMKII

F_CPU=20000000
FLAGS=-mmcu=$(MCU) -DF_CPU=$(F_CPU)UL -Os -Wall

SRC=main.c
HDR=

default: avr.hex

%.hex: %.elf
	avr-objcopy -j .text -j .data -O ihex $< $@

avr.elf: $(SRC) $(HDR)
	avr-g++ $(FLAGS) $(SRC) -o avr.elf

program: avr.hex
	avrdude -p $(PART) -c $(PROG) -P usb -B 7 -U flash:w:avr.hex
