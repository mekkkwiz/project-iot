#include <ESP8266HTTPClient.h>
#include <ESP8266WiFi.h>
#include <WiFiClient.h>

// const char* ssid = "308_MAIFREE_WIFI";
// const char* password = "beer2543";

const char* ssid = "KonSod";
const char* password = "12345678";

const char* serverUrl = "http://5351-2001-44c8-4231-c314-244c-c74f-a2dd-7d91.ap.ngrok.io/api/bins";

#define TRIG_PIN 16
#define ECHO_PIN 5
#define LED_PIN 0
#define RESISTOR_PIN A0

long duration;
int distance;
String previousStatus = "";

void setup() {
  Serial.begin(9600);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(2000);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi is connected");
}

void loop() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  // for real untrasonic
  duration = pulseIn(ECHO_PIN, HIGH);
  distance = duration * 0.034 / 2;

  // // untrasonic simulator with variable resistor
  // int resistance = analogRead(RESISTOR_PIN);
  // int distance = map(resistance, 0, 1023, 0, 500);



  Serial.print("Distance: ");
  Serial.println(distance);

  String currentStatus;
  if (distance < 50) {            // if bin is full
    digitalWrite(LED_PIN, HIGH);  // turn LED to red
    currentStatus = "full";
    delay(5000);                 // wait for 5 seconds
  } else {
    digitalWrite(LED_PIN, LOW);   // turn LED off
    currentStatus = "not full";
    delay(5000);                 // wait for 5 seconds
  }

  if (currentStatus != previousStatus) {
    sendRequest(currentStatus);
    previousStatus = currentStatus;
  }
}

void sendRequest(String status)
{
  if (WiFi.status() == WL_CONNECTED)
  {
    HTTPClient http;
    WiFiClient client;

    http.begin(client, serverUrl);
    http.addHeader("Content-Type", "application/json");

    const String binId = "bin-02";
    const String binLocation = "{\"lat\":18.7954436,\"lng\":98.9513678}";

    String payload = "{\"id\":\"" + binId + "\",\"location\":" + binLocation + ",\"status\":\"" + status + "\"}";
    Serial.print("Payload: ");
    Serial.println(payload);
    Serial.print("POST payload to URL: ");
    Serial.println(serverUrl);
    int httpCode = http.POST(payload);
    if (httpCode > 0)
    {
      String response = http.getString();
      Serial.print("Response: ");
      Serial.println(response);
    }
    else
    {
      Serial.print("httpCode: ");
      Serial.println(httpCode);
      Serial.println("Error sending request");
    }

    http.end();
  }
}
