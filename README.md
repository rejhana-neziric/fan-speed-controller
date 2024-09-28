# Fan Speed Controller

The Fan Speed Controller is an IoT project developed during my third-year coursework at the Faculty of Information Technologies in Mostar. It automatically controls a fan's rotation speed based on the ambient room temperature. The system features three predefined rotation speeds: low, medium, and high.

The user must enter two threshold values: threshold1 and threshold2.

Threshold1 represents the boundary between the low and medium speeds, while threshold2 represents the boundary between the medium and high speeds.

Based on the entered temperature thresholds, the fan operates as follows:

The fan operates at low speed if the current room temperature is below threshold1.
The fan operates at medium speed if the current temperature is between threshold1 and threshold2, and if the current temperature is above threshold2 the fan operates at high speed.

# Components
The following components were utilized in this project:

- WeMos D1
- DHT11 Sensor
- L298N Motor Driver
- DC Fan
- 12V Power Supply
- 3 LED Diodes
- 3 Resistors (220Ω)


![image](https://github.com/user-attachments/assets/9975d004-99df-49e1-b19b-056ac0f1febd)



# Web Application

The web application is developed using JavaScript, HTML, and CSS, with Firebase serving as the database solution.

![image](https://github.com/user-attachments/assets/7eb11df7-ee7a-4611-806d-f706f2243a68)
