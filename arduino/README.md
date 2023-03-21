# Smart Bin Arduino Code

This is the Arduino code for a smart bin that measures the distance using an ultrasonic sensor and sends a request to an API when the bin is full.

## Setup

To use this code, you will need an ESP12-F microcontroller, an ultrasonic sensor, and an LED.

You will also need to connect your ESP12-F to the internet by providing your WiFi SSID and password.

Make sure to install the `ESP8266HTTPClient.h`, `WiFiClient.h` and `ESP8266WiFi.h` libraries before uploading the code to the ESP12-F.

## Usage

The ultrasonic sensor measures the distance from the top of the bin to the trash inside. When the distance is less than 50 centimeters, the bin is considered full and the LED will turn red. At the same time, the code will send a POST request to the API with the bin ID, location, and status set to "full". After a 5 second delay, the LED will turn off.

If the distance is more than 50 centimeters, the bin is considered not full and the LED will remain off. The code will send a POST request to the API with the bin ID, location, and status set to "not full". After a 10 second delay, the process will repeat.
