#include <ESP8266WiFi.h>
#include <Firebase_ESP_Client.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"
#include "DHT.h"

#define WIFI_SSID "SSID"
#define WIFI_PASSWORD "PASSWORD"
#define API_KEY "AIzaSyBz3Yxxu2b4UET0n32JK806GhTWxyesUg4"
#define DATABASE_URL "https://iot-project-c659d-default-rtdb.firebaseio.com/"

#define MOTOR_PIN_ENA D1
#define MOTOR_PIN_IN1 D2
#define MOTOR_PIN_IN2 D3

#define DHT11_PIN D4

#define LED_PIN1 D5
#define LED_PIN2 D6
#define LED_PIN3 D7

FirebaseData fdbo;
FirebaseAuth auth;
FirebaseConfig config;

DHT dht11(DHT11_PIN, DHT11);

unsigned sendDataPrevMillis = 0;
bool signupOK = false;
bool fanStatus = false;
float tresholdTemperature1 = 0.0;
float tresholdTemperature2 = 0.0;
int speed = 0;

void setup() {
  Serial.begin(115200);

  connectWiFi(); 
  initializeFirebase(); 

  dht11.begin();

  // Pin modes
  pinMode(MOTOR_PIN_ENA, OUTPUT);
  pinMode(MOTOR_PIN_IN1, OUTPUT);
  pinMode(MOTOR_PIN_IN2, OUTPUT);
  pinMode(LED_PIN1, OUTPUT);
  pinMode(LED_PIN2, OUTPUT);
  pinMode(LED_PIN3, OUTPUT);
}

void loop() {
  if (Firebase.ready() && signupOK && (millis() - sendDataPrevMillis > 5000 || sendDataPrevMillis == 0)) {
    sendDataPrevMillis = millis();
  }

  controlFan();
}

void connectWiFi() {
  Serial.print("Connecting to WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println("\nConnected to WiFi with IP: " + WiFi.localIP().toString());
}

void initializeFirebase() {
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  if (Firebase.signUp(&config, &auth, "", "")) {
    Serial.println("Firebase signup OK");
    signupOK = true;
  } else {
    Serial.printf("Firebase signup failed: %s\n", config.signer.signupError.message.c_str());
  }

  config.token_status_callback = tokenStatusCallback;
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}

void controlFan() {
  float currentTempC = dht11.readTemperature();
  
  updateFirebaseData("Sensor/value", currentTempC, "Failed to update temperature");

  if (Firebase.RTDB.getFloat(&fdbo, "/Treshold1/value/")) {
    tresholdTemperature1 = fdbo.floatData();
  }
  if (Firebase.RTDB.getFloat(&fdbo, "/Treshold2/value/")) {
    tresholdTemperature2 = fdbo.floatData();
  }

  if (Firebase.RTDB.getBool(&fdbo, "/Fan/value/")) {
    if (fdbo.dataType() == "boolean") {
      fanStatus = fdbo.boolData();
    }
  }

  // Control fan speed based on thresholds and temperature
  if (fanStatus) {
    if (currentTempC >= tresholdTemperature2) {
      setFanSpeed(3, 255, "Max", LED_PIN3);
    } else if (currentTempC >= tresholdTemperature1) {
      setFanSpeed(2, 150, "Mid", LED_PIN2);
    } else {
      setFanSpeed(1, 80, "Low", LED_PIN1);
    }
  } else {
    stopFan();
  }
}

void setFanSpeed(int newSpeed, int pwmValue, const char* speedText, int ledPin) {
  analogWrite(MOTOR_PIN_ENA, pwmValue);
  digitalWrite(MOTOR_PIN_IN1, HIGH);
  digitalWrite(MOTOR_PIN_IN2, LOW);

  Serial.printf("Fan Speed: %s\n", speedText);
  controlLEDs(ledPin);

  if (speed != newSpeed) {
    speed = newSpeed;
    if (Firebase.RTDB.setInt(&fdbo, "Speed/value", speed)) {}
  }
}

void stopFan() {
  analogWrite(MOTOR_PIN_ENA, 0);
  digitalWrite(MOTOR_PIN_IN1, LOW);
  digitalWrite(MOTOR_PIN_IN2, LOW);
  controlLEDs(LOW);
  Serial.print("FAN: Off");
  if (Firebase.RTDB.setInt(&fdbo, "Speed/value", speed)) {}
}

void controlLEDs(int activePin) {
  digitalWrite(LED_PIN1, LOW);
  digitalWrite(LED_PIN2, LOW);
  digitalWrite(LED_PIN3, LOW);

  if (activePin != LOW) {
    digitalWrite(activePin, HIGH);
  }
}

void updateFirebaseData(const char* path, float value, const char* errorMsg) {
  if (!Firebase.RTDB.setFloat(&fdbo, path, value)) {
    Serial.printf("%s: %s\n", errorMsg, fdbo.errorReason().c_str());
  }
}


